import './bootstrap'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'

const el = document.getElementById('loading-screen')
if (el) {
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
}

createInertiaApp({
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el)
        root.render(<App {...props} />)
    },
    progress: {
        color: '#696cff',
    },
})
