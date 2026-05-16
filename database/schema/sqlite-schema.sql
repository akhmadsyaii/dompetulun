CREATE TABLE "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "currency" varchar not null default 'Rp',
  "dark_mode" tinyint(1) not null default '0'
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_expiration_index" on "cache"("expiration");
CREATE TABLE "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_locks_expiration_index" on "cache_locks"("expiration");
CREATE TABLE "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE "debts"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "creditor_name" varchar not null,
  "total_amount" numeric not null,
  "remaining_amount" numeric not null,
  "description" text,
  "due_date" date not null,
  "status" varchar not null,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "debt_payments"(
  "id" integer primary key autoincrement not null,
  "debt_id" integer not null,
  "amount" numeric not null,
  "paid_at" date not null,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("debt_id") references "debts"("id") on delete cascade
);
CREATE TABLE "budgets"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "category" varchar not null,
  "amount" numeric not null,
  "period" varchar not null default 'monthly',
  "month" integer not null,
  "year" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "goals"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar not null,
  "target_amount" numeric not null,
  "current_amount" numeric not null default '0',
  "deadline" date,
  "icon" varchar,
  "color" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "recurring_bills"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar not null,
  "amount" numeric not null,
  "category" varchar not null,
  "frequency" varchar not null default 'monthly',
  "due_day" integer not null,
  "notes" text,
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "bill_payments"(
  "id" integer primary key autoincrement not null,
  "bill_id" integer not null,
  "amount" numeric not null,
  "paid_at" date not null,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("bill_id") references "recurring_bills"("id") on delete cascade
);
CREATE TABLE "assets"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar not null,
  "type" varchar not null,
  "value" numeric not null,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "wallets"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar not null,
  "type" varchar not null default 'cash',
  "initial_balance" numeric not null default '0',
  "icon" varchar,
  "color" varchar,
  "is_default" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "transactions"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "type" varchar not null,
  "category" varchar not null,
  "amount" numeric not null,
  "description" text,
  "date" date not null,
  "attachment" varchar,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  "wallet_id" integer,
  foreign key("user_id") references users("id") on delete cascade on update no action,
  foreign key("wallet_id") references "wallets"("id") on delete set null
);
CREATE TABLE "label_transaction"(
  "label_id" integer not null,
  "transaction_id" integer not null,
  foreign key("label_id") references "labels"("id") on delete cascade,
  foreign key("transaction_id") references "transactions"("id") on delete cascade,
  primary key("label_id", "transaction_id")
);
CREATE TABLE "labels"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar not null,
  "color" varchar not null default '#696cff',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE "goal_funding_rules"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "goal_id" integer not null,
  "type" varchar not null,
  "value" numeric not null,
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("goal_id") references "goals"("id") on delete cascade
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2024_01_01_000000_add_currency_and_dark_mode_to_users_table',2);
INSERT INTO migrations VALUES(5,'2024_01_01_000001_create_transactions_table',2);
INSERT INTO migrations VALUES(6,'2024_01_01_000002_create_debts_table',2);
INSERT INTO migrations VALUES(7,'2024_01_01_000003_create_debt_payments_table',2);
INSERT INTO migrations VALUES(8,'2026_05_15_235402_create_budgets_table',3);
INSERT INTO migrations VALUES(9,'2026_05_15_235402_create_goals_table',3);
INSERT INTO migrations VALUES(10,'2026_05_16_000421_create_recurring_bills_table',4);
INSERT INTO migrations VALUES(11,'2026_05_16_000422_create_bill_payments_table',4);
INSERT INTO migrations VALUES(12,'2026_05_16_000519_create_assets_table',5);
INSERT INTO migrations VALUES(13,'2026_05_16_000610_create_wallets_table',6);
INSERT INTO migrations VALUES(14,'2026_05_16_000611_add_wallet_id_to_transactions_table',6);
INSERT INTO migrations VALUES(15,'2026_05_16_000746_create_label_transaction_table',7);
INSERT INTO migrations VALUES(16,'2026_05_16_000746_create_labels_table',7);
INSERT INTO migrations VALUES(17,'2026_05_16_101051_create_goal_funding_rules_table',8);
