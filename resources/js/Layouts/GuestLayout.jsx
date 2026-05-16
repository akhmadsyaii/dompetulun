import { Head, Link } from '@inertiajs/react'
import { motion } from 'framer-motion'
import SneatLogo from '@/Components/SneatLogo'

export default function GuestLayout({ title, children }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full max-w-md"
                >
                    <div className="card-sneat px-8 py-10">
                        <div className="flex flex-col items-center mb-8">
                            <Link href="/" className="app-brand-link flex items-center gap-2 mb-4">
                                <span className="app-brand-logo text-primary flex items-center">
                                    <SneatLogo />
                                </span>
                                <span className="text-2xl font-semibold tracking-tight text-text-heading dark:text-text-heading-dark">
                                    Dompetulun
                                </span>
                            </Link>
                            {children}
                        </div>
                    </div>
                    <p className="text-center text-xs text-text-muted dark:text-text-muted-dark mt-6">
                        © 2026 Dompetulun. Personal Finance Manager
                    </p>
                </motion.div>
            </div>
        </>
    )
}
