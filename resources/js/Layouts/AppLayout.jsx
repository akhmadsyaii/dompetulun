import { useState, useEffect } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import BottomNav from '@/Components/BottomNav'
import Sidebar from '@/Components/Sidebar'
import FAB from '@/Components/FAB'
import TransactionForm from '@/Components/TransactionForm'
import ConfirmModal from '@/Components/ConfirmModal'
import useLocalStorage from '@/Hooks/useLocalStorage'

const pageVariants = {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, y: -2, transition: { duration: 0.12 } },
}

export default function AppLayout({ title, children }) {
    const { props: pageProps, url } = usePage()
    const auth = pageProps.auth
    const user = auth?.user
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dark, setDark] = useLocalStorage('theme', false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [showGlobalTx, setShowGlobalTx] = useState(false)

    const toggleDark = () => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        axios.post('/settings/toggle-dark-mode', { dark_mode: next }).catch(() => {})
    }

    const handleLogout = () => setShowLogoutModal(true)
    const confirmLogout = () => router.post('/logout')

    useEffect(() => {
        window.scrollTo(0, 0)
        const el = document.getElementById('loading-screen')
        if (el) {
            el.style.opacity = '0'
            setTimeout(() => el.remove(), 300)
        }
    }, [url])

    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
            if (e.key === 'n') fabClick()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    const fabClick = () => {
        setShowGlobalTx(true)
    }

    const handleGlobalSave = async (formData) => {
        await axios.post('/transactions', formData)
        toast.success('Transaksi dibuat')
        setShowGlobalTx(false)
        window.dispatchEvent(new CustomEvent('refresh-data'))
    }

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex">
                <Sidebar
                    user={user}
                    dark={dark}
                    onToggleDark={toggleDark}
                    open={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={() => setShowLogoutModal(true)}
                />

                <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                    <header className="header-sneat sticky top-0 z-30">
                        <div className="flex items-center justify-between px-4 md:px-6 h-16">
                            <div className="flex items-center gap-4">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted"
                                >
                                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                                </motion.button>

                                <h1 className="hidden sm:block text-base font-semibold text-text-heading dark:text-text-heading-dark truncate max-w-[200px] lg:max-w-none">
                                    {title || 'Dashboard'}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={toggleDark}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted transition"
                                    title="Toggle theme"
                                >
                                    <motion.div key={dark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                                        {dark ? <Sun size={19} /> : <Moon size={19} />}
                                    </motion.div>
                                </motion.button>

                                <div className="flex items-center gap-2 pl-2 border-l border-border dark:border-border-dark">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark leading-tight">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-text-muted dark:text-text-muted-dark leading-tight">
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="ml-1 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted transition"
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
                        <AnimatePresence mode="wait">
                            <motion.div key={url} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    <footer className="hidden lg:block px-6 py-4 border-t border-border dark:border-border-dark">
                        <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted-dark">
                            <span>© {new Date().getFullYear()} Dompetulun</span>
                            <span>Personal Finance Manager</span>
                        </div>
                    </footer>
                </div>

                <FAB onClick={fabClick} />
                <BottomNav />
            </div>

            <TransactionForm
                isOpen={showGlobalTx}
                onClose={() => setShowGlobalTx(false)}
                transaction={null}
                onSave={handleGlobalSave}
            />

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    className: 'toast-sneat',
                    style: {
                        background: 'var(--color-card)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                    },
                }}
            />

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                title="Konfirmasi Logout"
                message="Apakah kamu yakin ingin logout?"
                confirmText="Logout"
                variant="danger"
            />
        </>
    )
}
