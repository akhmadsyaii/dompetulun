import { Head, usePage, Link } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import StatCard from '@/Components/StatCard'
import CountUp from '@/Components/CountUp'
import AppLayout from '@/Layouts/AppLayout'
import { Wallet, ArrowUpRight, ArrowDownRight, Banknote, Receipt, ArrowRight, X, TrendingUp, TrendingDown, Bell, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react'
import CategoryBadge from '@/Components/CategoryBadge'

const COLORS = ['#ea5455', '#ff9f43', '#28c76f', '#696cff', '#00cfe8', '#f472b6', '#fb923c', '#94a3b8']

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Dashboard() {
    const { auth, summary, incomeByCategory, expenseByCategory, monthlyTrend, recentTransactions, todaySummary,
        momIncomeChange, momExpenseChange, thisMonthIncome, thisMonthExpense, lastMonthIncome, lastMonthExpense,
        unpaidBills, budgetsNearLimit } = usePage().props
    const user = auth?.user
    const s = summary || { total_income: 0, total_expense: 0, net_balance: 0, total_debt: 0 }
    const expenseData = expenseByCategory || []
    const trendData = monthlyTrend || []
    const recent = recentTransactions || []
    const today = todaySummary || { income: 0, expense: 0 }

    const savingsRate = thisMonthIncome > 0 ? (((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100).toFixed(1) : 0
    const netThisMonth = thisMonthIncome - thisMonthExpense

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={cardVariants} className="card-sneat p-5 bg-gradient-to-r from-primary to-primary-dark mb-6">
                    <div className="flex items-center justify-between relative">
                        <div>
                            <h1 className="text-lg font-semibold text-white">
                                Selamat Datang, {user?.name || 'User'}!
                            </h1>
                            <p className="text-white/70 text-sm mt-0.5">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="/transactions" className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm rounded-lg transition flex items-center gap-1.5">
                                <Receipt size={15} /> Transaksi Baru
                            </Link>
                            <Link href="/insights" className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm rounded-lg transition flex items-center gap-1.5">
                                <Sparkles size={15} /> Wawasan
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div variants={cardVariants} className="stat-card-sneat card-accent-top accent-income">
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pemasukan</p>
                        <p className="text-lg font-semibold text-income">{formatCurrency(thisMonthIncome)}</p>
                        {lastMonthIncome > 0 && (
                            <p className={`text-xs mt-1 flex items-center gap-0.5 ${momIncomeChange >= 0 ? 'text-income' : 'text-expense'}`}>
                                {momIncomeChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {momIncomeChange >= 0 ? '+' : ''}{momIncomeChange}% vs bulan lalu
                            </p>
                        )}
                    </motion.div>
                    <motion.div variants={cardVariants} className="stat-card-sneat card-accent-top accent-expense">
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pengeluaran</p>
                        <p className="text-lg font-semibold text-expense">{formatCurrency(thisMonthExpense)}</p>
                        {lastMonthExpense > 0 && (
                            <p className={`text-xs mt-1 flex items-center gap-0.5 ${momExpenseChange <= 0 ? 'text-income' : 'text-expense'}`}>
                                {momExpenseChange <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                {momExpenseChange >= 0 ? '+' : ''}{momExpenseChange}% vs bulan lalu
                            </p>
                        )}
                    </motion.div>
                    <motion.div variants={cardVariants} className="stat-card-sneat card-accent-top accent-primary">
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Bersih Bulan Ini</p>
                        <p className={`text-lg font-semibold ${netThisMonth >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(netThisMonth)}</p>
                        <p className="text-xs text-text-muted mt-1">Hari ini: {formatCurrency(today.income - today.expense)}</p>
                    </motion.div>
                    <motion.div variants={cardVariants} className="stat-card-sneat card-accent-top" style={{ borderTopColor: savingsRate >= 20 ? '#28c76f' : '#ff9f43' }}>
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Rasio Tabungan</p>
                        <p className={`text-lg font-semibold ${savingsRate >= 20 ? 'text-income' : 'text-warning'}`}>{savingsRate}%</p>
                        <p className="text-xs text-text-muted mt-1">{savingsRate >= 20 ? 'Sehat' : 'Target: 20%'}</p>
                    </motion.div>
                </div>

                {(unpaidBills > 0 || budgetsNearLimit > 0) && (
                    <motion.div variants={cardVariants} className="flex flex-wrap gap-3 mb-6">
                        {unpaidBills > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warning/10 border border-warning/20">
                                <Bell size={16} className="text-warning" />
                                <span className="text-xs font-medium text-warning">{unpaidBills} tagihan belum dibayar</span>
                            </div>
                        )}
                        {budgetsNearLimit > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-expense/10 border border-expense/20">
                                <AlertTriangle size={16} className="text-expense" />
                                <span className="text-xs font-medium text-expense">{budgetsNearLimit} anggaran hampir terlampaui</span>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                    <motion.div variants={cardVariants} className="card-sneat p-5 lg:col-span-2">
                        <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-4">Pengeluaran per Kategori</h5>
                        {expenseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="total" nameKey="category">
                                        {expenseData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => formatCurrency(val)}
                                        contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-text-muted text-center py-12">Belum ada data pengeluaran</p>
                        )}
                    </motion.div>

                    <motion.div variants={cardVariants} className="space-y-4">
                        <div className="card-sneat p-5">
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-4">Hari Ini</h5>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pemasukan</p>
                                    <p className="text-lg font-semibold text-income flex items-center gap-1.5">
                                        <ArrowUpRight size={16} />
                                        <CountUp to={today.income} duration={1.2} decimals={0} />
                                    </p>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pengeluaran</p>
                                    <p className="text-lg font-semibold text-expense flex items-center gap-1.5">
                                        <ArrowDownRight size={16} />
                                        <CountUp to={today.expense} duration={1.2} decimals={0} />
                                    </p>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Bersih</p>
                                    <p className={`text-lg font-semibold flex items-center gap-1.5 ${today.income - today.expense >= 0 ? 'text-income' : 'text-expense'}`}>
                                        <Wallet size={16} />
                                        <CountUp to={Math.abs(today.income - today.expense)} duration={1.2} decimals={0} />
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="card-sneat p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={16} className="text-primary" />
                                <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">Sekilas</h5>
                            </div>
                            <div className="space-y-2.5 text-sm text-text-muted">
                                <p className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-income shrink-0" />
                                    Total pemasukan tahun ini: {formatCurrency(s.total_income)}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-expense shrink-0" />
                                    Total pengeluaran tahun ini: {formatCurrency(s.total_expense)}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    Rata-rata pengeluaran/hari: {formatCurrency(new Date().getDate() > 0 ? s.total_expense / new Date().getDate() : 0)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <motion.div variants={cardVariants} className="card-sneat p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">Pemasukan vs Pengeluaran</h5>
                            <Link href="/reports" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                Detail <ArrowRight size={12} />
                            </Link>
                        </div>
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }}
                                        tickFormatter={(m) => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][m - 1] || m} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => 'Rp' + (v / 1000).toFixed(0) + 'k'} />
                                    <Tooltip formatter={(val) => formatCurrency(val)}
                                        contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text)' }} />
                                    <Bar dataKey="income" name="Pemasukan" fill="#28c76f" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Pengeluaran" fill="#ea5455" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-text-muted text-center py-12">Belum ada data bulanan</p>
                        )}
                    </motion.div>

                    <motion.div variants={cardVariants} className="card-sneat p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">Transaksi Terbaru</h5>
                            <Link href="/transactions" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight size={12} />
                            </Link>
                        </div>
                        {recent.length > 0 ? (
                            <div className="space-y-1">
                                {recent.map((t) => (
                                    <div key={t.id}
                                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${t.type === 'income' ? 'bg-icon-income' : 'bg-icon-expense'}`}>
                                                {t.type === 'income' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark truncate">
                                                    {t.description || 'No description'}
                                                </p>
                                                <CategoryBadge category={t.category} />
                                            </div>
                                        </div>
                                        <span className={`text-sm font-semibold shrink-0 ml-3 ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-8 text-center">
                                <Receipt size={32} className="text-text-muted mb-2" />
                                <p className="text-sm text-text-muted">Belum ada transaksi</p>
                                <p className="text-xs text-text-muted mt-1">Mulai dengan menambahkan transaksi pertama</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </AppLayout>
    )
}
