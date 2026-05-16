import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BarChart3, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import DateRangePicker from '@/Components/DateRangePicker'
import ExportButtons from '@/Components/ExportButtons'
import TransactionTable from '@/Components/TransactionTable'

const COLORS = ['#ea5455', '#ff9f43', '#28c76f', '#696cff', '#00cfe8', '#f472b6', '#fb923c', '#94a3b8']

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function ChartSkeleton() {
    return (
        <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-40" />
            <div className="skeleton-shimmer h-[300px] w-full" />
        </div>
    )
}

export default function Reports() {
    const today = new Date()
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(() => {
        setLoading(true)
        axios.get('/reports/data', { params: { start_date: startDate, end_date: endDate } })
            .then((res) => setData(res.data))
            .catch(() => toast.error('Gagal memuat laporan'))
            .finally(() => setLoading(false))
    }, [startDate, endDate])

    useEffect(() => { fetchData() }, [fetchData])

    const summary = data?.summary || { total_income: 0, total_expense: 0, net: 0, count: 0 }

    return (
        <AppLayout title="Reports">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Laporan</h4>
                </div>
                <ExportButtons filters={{ start_date: startDate, end_date: endDate }} />
            </div>

            <div className="card-sneat p-4 mb-6">
                <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e) }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-income">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-income flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Pemasukan</p>
                            <p className="text-lg font-semibold text-income mt-0.5">{formatCurrency(summary.total_income)}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card-sneat card-accent-top accent-expense">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-expense flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowDownRight size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Pengeluaran</p>
                            <p className="text-lg font-semibold text-expense mt-0.5">{formatCurrency(summary.total_expense)}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card-sneat card-accent-top accent-primary">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-primary flex items-center justify-center text-white shadow-sm shrink-0">
                            <Wallet size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Saldo Bersih</p>
                            <p className={`text-lg font-semibold mt-0.5 ${summary.net >= 0 ? 'text-text-heading' : 'text-expense'}`}>{formatCurrency(summary.net)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card-sneat p-5">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">Pengeluaran per Kategori</h5>
                    {loading ? (
                        <ChartSkeleton />
                    ) : data?.expense_by_category?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={data.expense_by_category} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="total" nameKey="category">
                                    {data.expense_by_category.map((entry, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: '#fff', border: 'none', borderRadius: '0.375rem', color: '#566a7f', boxShadow: '0 2px 6px rgba(67,89,113,0.12)' }} />
                                <Legend wrapperStyle={{ color: '#a1acb8', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center py-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-expense/10 flex items-center justify-center mb-3">
                                <BarChart3 size={28} className="text-expense" />
                            </div>
                            <p className="text-text-muted dark:text-text-muted-dark font-medium">Belum ada data pengeluaran</p>
                            <p className="text-xs text-text-muted mt-1">Transaksi akan muncul di sini setelah Anda menambahkannya</p>
                        </div>
                    )}
                </div>
                <div className="card-sneat p-5">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">Tren Pemasukan vs Pengeluaran</h5>
                    {loading ? (
                        <ChartSkeleton />
                    ) : data?.monthly_trend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.monthly_trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" opacity={0.8} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1acb8' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#a1acb8' }} />
                                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: '#fff', border: 'none', borderRadius: '0.375rem', color: '#566a7f', boxShadow: '0 2px 6px rgba(67,89,113,0.12)' }} />
                                <Line type="monotone" dataKey="income" stroke="#28c76f" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="expense" stroke="#ea5455" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center py-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <BarChart3 size={28} className="text-primary" />
                            </div>
                            <p className="text-text-muted dark:text-text-muted-dark font-medium">Belum ada data tren</p>
                            <p className="text-xs text-text-muted mt-1">Grafik akan muncul setelah ada transaksi bulanan</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-sneat overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Detail Transaksi</h5>
                </div>
                <TransactionTable transactions={data?.transactions || []} loading={loading} showActions={false} />
            </div>
        </AppLayout>
    )
}
