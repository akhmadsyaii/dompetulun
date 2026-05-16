import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Wallet, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'
import { allCategories } from '@/Components/CategoryBadge'

const expenseCategories = allCategories.expense

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
}

export default function Budget() {
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [form, setForm] = useState({ category: '', amount: '', period: 'monthly' })
    const [submitting, setSubmitting] = useState(false)
    const [reportData, setReportData] = useState([])
    const [reportLoading, setReportLoading] = useState(false)

    const fetchData = () => {
        setLoading(true)
        axios.get('/budgets/data')
            .then((res) => setBudgets(res.data || []))
            .catch(() => toast.error('Gagal memuat anggaran'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    useEffect(() => {
        setReportLoading(true)
        axios.get('/budgets/report')
            .then((res) => setReportData(res.data || []))
            .catch(() => {})
            .finally(() => setReportLoading(false))
    }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ category: '', amount: '', period: 'monthly' })
        setModalOpen(true)
    }

    const openEdit = (b) => {
        setEditing(b)
        setForm({ category: b.category, amount: String(b.amount), period: b.period })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (submitting) return
        if (!form.category || !form.amount) { toast.error('Lengkapi semua field'); return }
        setSubmitting(true)
        try {
            const payload = { category: form.category, amount: Number(form.amount.replace(/[^0-9]/g, '')), period: form.period }
            if (editing) {
                const res = await axios.put(`/budgets/${editing.id}`, payload)
                toast.success(res.data.message)
            } else {
                const res = await axios.post('/budgets', payload)
                toast.success(res.data.message)
            }
            setModalOpen(false)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = () => {
        if (!deleteTarget) return
        axios.delete(`/budgets/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0)
    const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0)

    return (
        <AppLayout title="Anggaran">
            <Head title="Anggaran" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Anggaran</h4>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={openCreate} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Anggaran
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-primary">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Anggaran</p>
                    <p className="text-lg font-semibold text-text-heading">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-expense">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Terpakai</p>
                    <p className="text-lg font-semibold text-expense">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-income">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Sisa</p>
                    <p className="text-lg font-semibold text-income">{formatCurrency(totalBudget - totalSpent)}</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card-sneat p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            ) : budgets.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState title="Belum ada anggaran" description="Buat anggaran pertama untuk mulai mengatur pengeluaran" />
                </div>
            ) : (
                <div className="space-y-3">
                    {budgets.map((b) => {
                        const spent = Number(b.spent || 0)
                        const pct = Number(b.progress || 0)
                        const over = spent > Number(b.amount)
                        return (
                            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-sneat p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h6 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark capitalize">{b.category}</h6>
                                        <p className="text-xs text-text-muted">{b.period}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition"><Pencil size={15} /></button>
                                        <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${over ? 'bg-expense' : pct > 80 ? 'bg-warning' : 'bg-income'}`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className={`text-xs font-medium ${over ? 'text-expense' : 'text-text-muted'}`}>
                                        {formatCurrency(spent)} terpakai
                                    </span>
                                    <span className="text-xs font-medium text-text-muted">
                                        {formatCurrency(b.amount)}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            <AnimatePresence>
                {modalOpen && (
                    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="hidden"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
                        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
                            className="card-sneat p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                                {editing ? 'Edit Anggaran' : 'Tambah Anggaran'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Kategori</label>
                                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                        className="form-control-sneat">
                                        <option value="">Pilih kategori</option>
                                        {expenseCategories.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Jumlah Anggaran</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
                                        <input type="text" value={form.amount}
                                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') }))}
                                            className="form-control-sneat pl-10 pr-4 py-2.5" placeholder="0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Periode</label>
                                    <select value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                                        className="form-control-sneat">
                                        <option value="monthly">Bulanan</option>
                                        <option value="yearly">Tahunan</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setModalOpen(false)} className="btn-outline-sneat flex-1 py-2.5 text-sm">Batal</button>
                                    <button onClick={handleSave} disabled={submitting}
                                        className="btn-primary-sneat flex-1 py-2.5 text-sm">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-primary" />
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Tren Anggaran vs Realisasi</h5>
                </div>

                {reportLoading ? (
                    <div className="card-sneat p-5 animate-pulse">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                ) : reportData.length > 0 ? (
                    <div className="card-sneat p-5">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => 'Rp' + (v / 1000).toFixed(0) + 'k'} />
                                    <Tooltip formatter={(v) => 'Rp ' + Number(v).toLocaleString('id-ID')} />
                                    <Legend />
                                    <Bar dataKey="total_budget" fill="#696cff" radius={[4, 4, 0, 0]} name="Anggaran" />
                                    <Bar dataKey="total_spent" fill="#ea5455" radius={[4, 4, 0, 0]} name="Realisasi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                            {reportData.map((m) => {
                                const isOver = m.total_spent > m.total_budget && m.total_budget > 0
                                return (
                                    <div key={`${m.month}-${m.year}`} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                                        <p className="text-[0.625rem] text-text-muted mb-1">{m.label}</p>
                                        <p className={`text-xs font-semibold ${isOver ? 'text-expense' : 'text-income'}`}>
                                            {m.progress}%
                                        </p>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full rounded-full ${isOver ? 'bg-expense' : 'bg-income'}`}
                                                style={{ width: `${Math.min(m.progress, 100)}%` }} />
                                        </div>
                                        {isOver && (
                                            <p className="text-[0.625rem] text-expense mt-0.5">Over budget</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="card-sneat p-5 text-center">
                        <p className="text-sm text-text-muted">Data anggaran belum tersedia</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Anggaran"
                message={`Hapus anggaran ${deleteTarget?.category || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
