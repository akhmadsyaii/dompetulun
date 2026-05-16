import { Link, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, LogOut, X, LayoutDashboard, ArrowLeftRight, Banknote, BarChart3, Settings, Tags, Wallet, Target, Bell, TrendingUp, Download, Landmark, CalendarDays, Sparkles, Image } from 'lucide-react'
import SneatLogo from '@/Components/SneatLogo'

const menuSections = [
    {
        header: 'Keuangan',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
            { href: '/wallets', label: 'Dompet', icon: Landmark },
            { href: '/debts', label: 'Utang', icon: Banknote },
            { href: '/reports', label: 'Laporan', icon: BarChart3 },
            { href: '/calendar', label: 'Kalender', icon: CalendarDays },
            { href: '/insights', label: 'Wawasan', icon: Sparkles },
        ],
    },
    {
        header: 'Perencanaan',
        items: [
            { href: '/budget', label: 'Anggaran', icon: Wallet },
            { href: '/goals', label: 'Target', icon: Target },
            { href: '/bills', label: 'Tagihan', icon: Bell },
            { href: '/net-worth', label: 'Kekayaan', icon: TrendingUp },
        ],
    },
    {
        header: 'Data',
        items: [
            { href: '/settings/categories', label: 'Kategori', icon: Tags },
            { href: '/receipts', label: 'Struk', icon: Image },
            { href: '/export', label: 'Ekspor / Impor', icon: Download },
        ],
    },
    {
        header: 'Lainnya',
        items: [
            { href: '/settings', label: 'Pengaturan', icon: Settings },
        ],
    },
]

export default function Sidebar({ user, dark, onToggleDark, open, onToggle, onLogout }) {
    const { url } = usePage()

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle}
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-2.5 app-brand">
                            <span className="app-brand-logo text-primary flex items-center">
                                <SneatLogo />
                            </span>
                            <span className="text-lg font-semibold tracking-tight text-white">Dompetulun</span>
                        </Link>
                        <button onClick={onToggle} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/60">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3">
                        {menuSections.map((section, si) => (
                            <div key={si}>
                                {section.header && (
                                    <div className="sidebar-header">{section.header}</div>
                                )}
                                {section.items.map((link) => {
                                    const isActive = link.href === '/'
                                        ? url === link.href
                                        : link.href === '/settings'
                                            ? url === '/settings'
                                            : url.startsWith(link.href)
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={onToggle}
                                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                                        >
                                            <link.icon size={19} className="shrink-0" />
                                            <span className="flex-1">{link.label}</span>
                                            {link.badge && (
                                                <span className="text-[0.625rem] font-semibold px-1.5 py-0.5 rounded-sm bg-primary text-white">{link.badge}</span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0">
                        <button onClick={onToggleDark} className="sidebar-link w-full">
                            <motion.div key={dark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                                {dark ? <Sun size={19} /> : <Moon size={19} />}
                            </motion.div>
                            {dark ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button onClick={onLogout} className="sidebar-link w-full hover:!bg-red-500/10 !text-red-400">
                            <LogOut size={19} />
                            Logout
                        </button>
                        <div className="px-4 pt-2">
                            <p className="text-xs text-white/40 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
