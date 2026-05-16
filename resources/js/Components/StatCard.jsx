import { motion } from 'framer-motion'
import CountUp from '@/Components/CountUp'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function CurrencyCount({ value }) {
    const abs = Math.abs(value ?? 0)
    return (
        <span className="inline-flex items-baseline gap-0.5">
            <span className="text-sm font-medium text-text-muted">Rp</span>
            <CountUp to={abs} duration={1.5} decimals={0} />
        </span>
    )
}

export default function StatCard({ title, value, icon, color, accent, trend, trendUp, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`stat-card-sneat card-accent-top ${accent || ''}`}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: delay + 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    className={`w-12 h-12 rounded-lg bg-icon-${accent ? accent.replace('accent-', '') : 'primary'} flex items-center justify-center text-white shadow-sm shrink-0`}
                >
                    {icon}
                </motion.div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">{title}</p>
                    <p className="text-xl font-semibold text-text-heading dark:text-text-heading-dark mt-0.5 truncate">
                        <CurrencyCount value={value} />
                    </p>
                    {trend && (
                        <motion.p
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + 0.5 }}
                            className={`text-xs mt-0.5 flex items-center gap-0.5 ${trendUp ? 'text-income' : 'text-expense'}`}
                        >
                            <span>{trendUp ? '↑' : '↓'}</span>
                            {trend}
                        </motion.p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
