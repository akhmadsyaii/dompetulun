import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, Info, Bell, Banknote, Smile, ArrowUp, ArrowDown, Lightbulb, Sparkles, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import AppLayout from '@/Layouts/AppLayout'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const tipIcons = { TrendingUp, TrendingDown, AlertTriangle, Info, Bell, Banknote, Smile, ArrowUp, ArrowDown }

const COLORS = ['#696cff', '#28c76f', '#ea5455', '#ff9f43', '#00cfe8', '#7367f0', '#2ec4b6', '#e73f7a']

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

function HealthGauge({ score }) {
    const r = 60
    const circumference = 2 * Math.PI * r
    const offset = circumference - (score / 100) * circumference
    const color = score >= 80 ? '#28c76f' : score >= 60 ? '#ff9f43' : score >= 40 ? '#ea5455' : '#ea5455'

    return (
        <div className="flex flex-col items-center">
            <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-gray-700" />
                <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                <text x="80" y="72" textAnchor="middle" fontSize="32" fontWeight="700" fill="currentColor" className="dark:fill-white">
                    {score}
                </text>
                <text x="80" y="94" textAnchor="middle" fontSize="12" fill="#8b8b9e" className="dark:fill-gray-400">
                    Health Score
                </text>
            </svg>
            <p className="text-xs text-text-muted mt-1">
                {score >= 80 ? 'Sangat Sehat' : score >= 60 ? 'Cukup Sehat' : score >= 40 ? 'Perlu Perhatian' : 'Kritis'}
            </p>
        </div>
    )
}

export default function Insights() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = () => {
        setLoading(true)
        axios.get('/insights/data')
            .then((res) => setData(res.data))
            .catch(() => toast.error('Gagal memuat wawasan'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    if (loading || !data) {
        return (
            <AppLayout title="Wawasan">
                <Head title="Wawasan" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card-sneat p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
                <div className="card-sneat p-8 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </AppLayout>
        )
    }

    const { this_month, last_month, expense_by_category, category_changes, trends, health_score, tips } = data
    const expensePct = this_month.total_income > 0
        ? ((this_month.total_expense / this_month.total_income) * 100).toFixed(1)
        : 0
    const savingsPct = this_month.total_income > 0
        ? (((this_month.total_income - this_month.total_expense) / this_month.total_income) * 100).toFixed(1)
        : 0

    return (
        <AppLayout title="Wawasan">
            <Head title="Wawasan" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles size={22} className="text-primary" />
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Wawasan Keuangan</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <motion.div variants={cardVariants} className="card-sneat p-5 lg:col-span-1 flex items-center justify-center">
                        <HealthGauge score={health_score.score} />
                    </motion.div>

                    <motion.div variants={cardVariants} className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="stat-card-sneat card-accent-top accent-income">
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pemasukan</p>
                            <p className="text-lg font-semibold text-income">{formatCurrency(this_month.total_income)}</p>
                            {last_month.total_income > 0 && (
                                <IncomeChange current={this_month.total_income} previous={last_month.total_income} />
                            )}
                        </div>
                        <div className="stat-card-sneat card-accent-top accent-expense">
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pengeluaran</p>
                            <p className="text-lg font-semibold text-expense">{formatCurrency(this_month.total_expense)}</p>
                            {last_month.total_expense > 0 && (
                                <ExpenseChange current={this_month.total_expense} previous={last_month.total_expense} />
                            )}
                        </div>
                        <div className="stat-card-sneat card-accent-top" style={{ borderTopColor: savingsPct >= 20 ? '#28c76f' : '#ff9f43' }}>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Tabungan</p>
                            <p className="text-lg font-semibold" style={{ color: savingsPct >= 20 ? '#28c76f' : '#ff9f43' }}>
                                {savingsPct}%
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                {savingsPct >= 20 ? 'Sehat ' : 'Target: 20% '}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <motion.div variants={cardVariants} className="card-sneat p-5 lg:col-span-2">
                        <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                            Tren Pengeluaran 6 Bulan
                        </h5>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis dataKey="month" tickFormatter={(m) => {
                                        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                                        return names[m - 1] || m
                                    }} tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => 'Rp' + (v / 1000).toFixed(0) + 'k'} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Line type="monotone" dataKey="income" stroke="#28c76f" strokeWidth={2} dot={{ r: 3 }} name="Pemasukan" />
                                    <Line type="monotone" dataKey="expense" stroke="#ea5455" strokeWidth={2} dot={{ r: 3 }} name="Pengeluaran" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="card-sneat p-5">
                        <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                            Pengeluaran per Kategori
                        </h5>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={expense_by_category} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                        {expense_by_category.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div variants={cardVariants} className="card-sneat p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={18} className="text-primary" />
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">Tips & Wawasan</h5>
                        </div>
                        <div className="space-y-3">
                            {tips.map((tip, i) => {
                                const Icon = tipIcons[tip.icon] || Info
                                const borderColor = tip.type === 'success' ? '#28c76f' : tip.type === 'danger' ? '#ea5455' : tip.type === 'warning' ? '#ff9f43' : '#696cff'
                                const bgColor = tip.type === 'success' ? 'bg-income/10' : tip.type === 'danger' ? 'bg-expense/10' : tip.type === 'warning' ? 'bg-warning/10' : 'bg-primary-light/50'
                                const iconColor = tip.type === 'success' ? 'text-income' : tip.type === 'danger' ? 'text-expense' : tip.type === 'warning' ? 'text-warning' : 'text-primary'
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                        className="flex items-start gap-3 p-3 rounded-lg border-l-2"
                                        style={{ borderLeftColor: borderColor }}>
                                        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center ${iconColor} shrink-0`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-text-heading dark:text-text-heading-dark">{tip.title}</p>
                                            <p className="text-xs text-text-muted mt-0.5">{tip.message}</p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="card-sneat p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={18} className="text-primary" />
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">Perubahan Kategori</h5>
                        </div>
                        <div className="space-y-3">
                            {category_changes.map((cat, i) => (
                                <motion.div key={cat.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cat.change_percent > 0 ? 'bg-expense' : 'bg-income'}`} />
                                        <span className="text-sm font-medium text-text-heading dark:text-text-heading-dark capitalize">{cat.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            {cat.change_percent > 0 ? (
                                                <TrendingUp size={14} className="text-expense" />
                                            ) : (
                                                <TrendingDown size={14} className="text-income" />
                                            )}
                                            <span className={`text-xs font-semibold ${cat.change_percent > 0 ? 'text-expense' : 'text-income'}`}>
                                                {cat.change_percent > 0 ? '+' : ''}{cat.change_percent}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">{formatCurrency(cat.current)}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {category_changes.length === 0 && (
                                <p className="text-sm text-text-muted text-center py-4">Belum ada data kategori</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={cardVariants} className="card-sneat p-5 mt-6">
                    <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                        Rincian Skor Kesehatan
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {health_score.details?.map((d, i) => (
                            <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-center">
                                <p className="text-2xl font-bold mb-1" style={{
                                    color: d.score >= 80 ? '#28c76f' : d.score >= 60 ? '#ff9f43' : '#ea5455'
                                }}>{d.score}</p>
                                <p className="text-xs font-medium text-text-heading dark:text-text-heading-dark">{d.label}</p>
                                <p className="text-[0.625rem] text-text-muted">Bobot {d.weight}</p>
                                <p className="text-[0.625rem] text-text-muted">{d.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    )
}

function IncomeChange({ current, previous }) {
    const diff = current - previous
    const pct = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0
    const isUp = diff >= 0
    return (
        <p className={`text-xs mt-1 flex items-center gap-0.5 ${isUp ? 'text-income' : 'text-expense'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? '+' : ''}{pct}% vs bulan lalu
        </p>
    )
}

function ExpenseChange({ current, previous }) {
    const diff = current - previous
    const pct = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0
    const isUp = diff >= 0
    return (
        <p className={`text-xs mt-1 flex items-center gap-0.5 ${isUp ? 'text-expense' : 'text-income'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? '+' : ''}{pct}% vs bulan lalu
        </p>
    )
}
