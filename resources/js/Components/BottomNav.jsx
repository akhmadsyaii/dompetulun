import { Link, usePage } from '@inertiajs/react'
import { LayoutDashboard, ArrowLeftRight, Banknote, BarChart3, Settings } from 'lucide-react'

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { href: '/debts', label: 'Utang', icon: Banknote },
    { href: '/reports', label: 'Laporan', icon: BarChart3 },
    { href: '/settings', label: 'Pengaturan', icon: Settings },
]

export default function BottomNav() {
    const { url } = usePage()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border dark:border-border-dark bg-white/90 dark:bg-card-dark/90 backdrop-blur-md">
            <div className="flex items-center justify-around py-1.5 px-2">
                {navLinks.map((link) => {
                    const isActive = link.href === '/'
                        ? url === link.href
                        : link.href === '/settings'
                            ? url === '/settings'
                            : url.startsWith(link.href)
                    return (
                        <Link key={link.href} href={link.href}
                            className={`nav-link-sneat ${isActive ? 'active' : ''}`}
                        >
                            <link.icon size={19} />
                            {link.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
