import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, TrendingUp, Home, PiggyBank, LineChart, Car, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const assetTypes = [
    { value: 'property', label: 'Properti', icon: Home },
    { value: 'savings', label: 'Tabungan', icon: PiggyBank },
    { value: 'investment', label: 'Investasi', icon: LineChart },
    { value: 'vehicle', label: 'Kendaraan', icon: Car },
    { value: 'other', label: 'Lainnya', icon: Building2 },
]

function getTypeIcon(type) {
    const found = assetTypes.find((t) => t.value === type)
    return found ? found.icon : Building2
}

function getTypeLabel(type) {
    const found = assetTypes.find((t) => t.value === type)
    return found ? found.label : 'Lainnya'
}

export default function NetWorth() {
    const [data, setData] = useState({ assets: [], total_assets: 0, total_debts: 0, net_worth: 0 })
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ name: '', type: 'property', value: '', notes: '' })

    const fetchData = () => {
        setLoading(true)
        axios.get('/net-worth/data')
            .then((res) => setData(res.data))
            .catch(() => toast.error('Gagal memuat data'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', type: 'property', value: '', notes: '' })
        setModalOpen(true)
    }

    const openEdit = (a) => {
        setEditing(a)
        setForm({ name: a.name, type: a.type, value: String(a.value), notes: a.notes || '' })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (submitting) return
        if (!form.name || !form.value) { toast.error('Lengkapi semua field wajib'); return }
        setSubmitting(true)
        try {
            const payload = {
                name: form.name,
                type: form.type,
                value: Number(form.value.replace(/[^0-9]/g, '')),
                notes: form.notes,
            }
            if (editing) {
                const res = await axios.put(`/net-worth/${editing.id}`, payload)
                toast.success(res.data.message)
            } else {
                const res = await axios.post('/net-worth', payload)
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
        axios.delete(`/net-worth/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const { assets, total_assets, total_debts, net_worth } = data
    const netWorthPositive = net_worth >= 0

    return (
        <AppLayout title="Kekayaan">
            <Head title="Kekayaan" />

            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Kekayaan Bersih</h4>
                <button onClick={openCreate} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Aset
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-income">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Aset</p>
                    <p className="text-lg font-semibold text-income">{formatCurrency(total_assets)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-expense">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Utang</p>
                    <p className="text-lg font-semibold text-expense">{formatCurrency(total_debts)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top" style={{ borderTopColor: netWorthPositive ? 'var(--color-income, #28c76f)' : 'var(--color-expense, #ea5455)' }}>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Kekayaan Bersih</p>
                    <p className={`text-lg font-semibold ${netWorthPositive ? 'text-income' : 'text-expense'}`}>
                        {formatCurrency(net_worth)}
                    </p>
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
            ) : assets.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState icon={TrendingUp} title="Belum ada aset" description="Tambah aset untuk menghitung kekayaan bersih" />
                </div>
            ) : (
                <div className="space-y-3">
                    {assets.map((asset) => {
                        const Icon = getTypeIcon(asset.type)
                        return (
                            <motion.div key={asset.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="card-sneat p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-icon-income flex items-center justify-center text-white shrink-0">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h6 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">{asset.name}</h6>
                                                <p className="text-xs text-text-muted">{getTypeLabel(asset.type)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-income">{formatCurrency(asset.value)}</p>
                                            </div>
                                        </div>
                                        {asset.notes && (
                                            <p className="text-xs text-text-muted mt-1">{asset.notes}</p>
                                        )}
                                        <div className="flex justify-end gap-1 mt-1">
                                            <button onClick={() => openEdit(asset)}
                                                className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(asset)}
                                                className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition">
                                                <Trash2 size={14} />
                                            </button>
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
                                {editing ? 'Edit Aset' : 'Tambah Aset'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Nama Aset</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="form-control-sneat" placeholder="Contoh: Rumah" />
                                </div>
                                <div>
                                    <label className="form-label-sneat">Jenis Aset</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {assetTypes.map((t) => {
                                            const TI = t.icon
                                            const sel = form.type === t.value
                                            return (
                                                <button key={t.value} type="button" onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition ${
                                                        sel ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 text-text-muted hover:bg-primary-light/50 hover:text-primary'
                                                    }`}>
                                                    <TI size={16} />
                                                    <span>{t.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Nilai</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
                                        <input type="text" value={form.value}
                                            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value.replace(/[^0-9]/g, '') }))}
                                            className="form-control-sneat pl-10 pr-4 py-2.5" placeholder="0" />
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
                title="Hapus Aset"
                message={`Hapus aset ${deleteTarget?.name || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
