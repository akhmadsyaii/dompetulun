import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CheckCircle, Circle, Bell, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'
import { allCategories } from '@/Components/CategoryBadge'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function getDaysUntil(dueDay) {
    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    let diff
    if (dueDay >= currentDay) {
        diff = dueDay - currentDay
    } else {
        diff = daysInMonth - currentDay + dueDay
    }
    return diff
}

export default function Bills() {
    const [bills, setBills] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        name: '', amount: '', category: '', frequency: 'monthly', due_day: '', notes: ''
    })

    const expenseCategories = allCategories.expense

    const fetchData = () => {
        setLoading(true)
        axios.get('/bills/data')
            .then((res) => setBills(res.data || []))
            .catch(() => toast.error('Gagal memuat tagihan'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', amount: '', category: '', frequency: 'monthly', due_day: '', notes: '' })
        setModalOpen(true)
    }

    const openEdit = (b) => {
        setEditing(b)
        setForm({
            name: b.name,
            amount: String(b.amount),
            category: b.category,
            frequency: b.frequency,
            due_day: String(b.due_day),
            notes: b.notes || ''
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (submitting) return
        if (!form.name || !form.amount || !form.category || !form.due_day) {
            toast.error('Lengkapi semua field wajib')
            return
        }
        setSubmitting(true)
        try {
            const payload = {
                name: form.name,
                amount: Number(form.amount.replace(/[^0-9]/g, '')),
                category: form.category,
                frequency: form.frequency,
                due_day: Number(form.due_day),
                notes: form.notes,
            }
            if (editing) {
                const res = await axios.put(`/bills/${editing.id}`, payload)
                toast.success(res.data.message)
            } else {
                const res = await axios.post('/bills', payload)
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
        axios.delete(`/bills/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const togglePaid = (bill) => {
        if (bill.paid_this_month) {
            axios.delete(`/bills/${bill.id}/pay`)
                .then((res) => { toast.success(res.data.message); fetchData() })
                .catch(() => toast.error('Gagal mengubah status'))
        } else {
            axios.post(`/bills/${bill.id}/pay`, {
                amount: bill.amount,
                paid_at: new Date().toISOString().split('T')[0]
            })
                .then((res) => { toast.success(res.data.message); fetchData() })
                .catch(() => toast.error('Gagal mengubah status'))
        }
    }

    const totalMonthly = bills.reduce((s, b) => s + Number(b.amount), 0)
    const paidCount = bills.filter((b) => b.paid_this_month).length

    return (
        <AppLayout title="Tagihan">
            <Head title="Tagihan" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Tagihan Berulang</h4>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={openCreate} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Tagihan
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-primary">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Bulanan</p>
                    <p className="text-lg font-semibold text-text-heading">{formatCurrency(totalMonthly)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-income">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Lunas</p>
                    <p className="text-lg font-semibold text-income">{paidCount}/{bills.length}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-warning">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Belum Lunas</p>
                    <p className="text-lg font-semibold text-warning">{bills.length - paidCount}</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card-sneat p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            ) : bills.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState icon={Bell} title="Belum ada tagihan" description="Tambah tagihan berulang untuk mulai tracking pembayaran" />
                </div>
            ) : (
                <div className="space-y-3">
                    {bills.map((bill) => {
                        const daysUntil = getDaysUntil(bill.due_day)
                        const isOverdue = !bill.paid_this_month && daysUntil <= 0
                        const isDueSoon = !bill.paid_this_month && daysUntil > 0 && daysUntil <= 7
                        const Icon = bill.paid_this_month ? CheckCircle : (isOverdue ? Calendar : Circle)

                        return (
                            <motion.div key={bill.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className={`card-sneat p-5 ${isOverdue ? 'ring-1 ring-expense/30' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <button onClick={() => togglePaid(bill)}
                                        className={`mt-0.5 transition-colors ${bill.paid_this_month ? 'text-income' : isOverdue ? 'text-expense' : 'text-text-muted hover:text-income'}`}>
                                        <Icon size={22} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h6 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">{bill.name}</h6>
                                                <p className="text-xs text-text-muted capitalize">{bill.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">
                                                    {formatCurrency(bill.amount)}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    Tgl {bill.due_day}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                {bill.paid_this_month ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-income bg-income/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle size={12} /> Lunas
                                                    </span>
                                                ) : isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-expense bg-expense/10 px-2 py-0.5 rounded-full">
                                                        <Calendar size={12} /> Terlewat
                                                    </span>
                                                ) : isDueSoon ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                                                        <Bell size={12} /> {daysUntil} hari lagi
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-text-muted">{daysUntil} hari lagi</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(bill)}
                                                    className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition">
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(bill)}
                                                    className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            <AnimatePresence>
                {modalOpen && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial="hidden" animate="visible" exit="hidden"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
                        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} initial="hidden" animate="visible" exit="hidden"
                            className="card-sneat p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                                {editing ? 'Edit Tagihan' : 'Tambah Tagihan'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Nama Tagihan</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="form-control-sneat" placeholder="Contoh: Internet" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label-sneat">Jumlah</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">Rp</span>
                                            <input type="text" value={form.amount}
                                                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') }))}
                                                className="form-control-sneat pl-8 pr-3 py-2.5" placeholder="0" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label-sneat">Tgl Jatuh Tempo</label>
                                        <input type="number" min="1" max="31" value={form.due_day}
                                            onChange={(e) => setForm((f) => ({ ...f, due_day: e.target.value.replace(/[^0-9]/g, '') }))}
                                            className="form-control-sneat" placeholder="1-31" />
                                    </div>
                                </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label-sneat">Frekuensi</label>
                                        <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                                            className="form-control-sneat">
                                            <option value="monthly">Bulanan</option>
                                            <option value="yearly">Tahunan</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Catatan (opsional)</label>
                                    <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                        rows={2} className="form-control-sneat resize-none" />
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

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Tagihan"
                message={`Hapus tagihan ${deleteTarget?.name || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
