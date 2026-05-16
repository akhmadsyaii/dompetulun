FROM composer:latest AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

FROM node:22-alpine AS node
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-optional
COPY . .
RUN npm run build

FROM php:8.4-fpm-alpine
RUN apk add --no-cache nginx supervisor
RUN docker-php-ext-install pdo pdo_sqlite

WORKDIR /var/www/html
COPY --from=vendor /app /var/www/html
COPY --from=node /app/public/build /var/www/html/public/build

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
