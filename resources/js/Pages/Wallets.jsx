import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Wallet, Landmark, Smartphone, Building2, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const walletTypes = [
    { value: 'cash', label: 'Tunai', icon: Wallet },
    { value: 'bank', label: 'Bank', icon: Landmark },
    { value: 'ewallet', label: 'E-Wallet', icon: Smartphone },
    { value: 'other', label: 'Lainnya', icon: Building2 },
]

function getTypeIcon(type) {
    const found = walletTypes.find((t) => t.value === type)
    return found ? found.icon : MoreHorizontal
}

const typeColors = {
    cash: '#28c76f',
    bank: '#696cff',
    ewallet: '#ff9f43',
    other: '#00cfe8',
}

export default function Wallets() {
    const [wallets, setWallets] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ name: '', type: 'cash', initial_balance: '' })

    const fetchData = () => {
        setLoading(true)
        axios.get('/wallets/data')
            .then((res) => setWallets(res.data || []))
            .catch(() => toast.error('Gagal memuat dompet'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', type: 'cash', initial_balance: '' })
        setModalOpen(true)
    }

    const openEdit = (w) => {
        setEditing(w)
        setForm({ name: w.name, type: w.type, initial_balance: String(w.initial_balance) })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (submitting) return
        if (!form.name || !form.initial_balance) { toast.error('Lengkapi semua field wajib'); return }
        setSubmitting(true)
        try {
            const payload = {
                name: form.name,
                type: form.type,
                initial_balance: Number(form.initial_balance.replace(/[^0-9]/g, '')),
            }
            if (editing) {
                const res = await axios.put(`/wallets/${editing.id}`, payload)
                toast.success(res.data.message)
            } else {
                const res = await axios.post('/wallets', payload)
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
        axios.delete(`/wallets/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0)

    return (
        <AppLayout title="Dompet">
            <Head title="Dompet" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Dompet</h4>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                        {wallets.length} dompet
                    </p>
                </div>
                <button onClick={openCreate} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Dompet
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-primary">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Saldo</p>
                    <p className="text-lg font-semibold text-text-heading">{formatCurrency(totalBalance)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-income">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Dompet</p>
                    <p className="text-lg font-semibold text-income">{wallets.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="card-sneat p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : wallets.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState icon={Wallet} title="Belum ada dompet" description="Buat dompet untuk mulai melacak keuangan" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wallets.map((wallet) => {
                        const Icon = getTypeIcon(wallet.type)
                        const color = wallet.color || typeColors[wallet.type] || '#696cff'
                        return (
                            <motion.div key={wallet.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="card-sneat p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                                            style={{ background: color }}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">
                                                {wallet.name}
                                            </h6>
                                            <p className="text-xs text-text-muted capitalize">{wallet.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(wallet)}
                                            className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => setDeleteTarget(wallet)}
                                            className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-text-muted">Saldo</p>
                                        <p className="text-lg font-semibold" style={{ color }}>
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                    </div>
                                    {wallet.is_default && (
                                        <span className="text-[0.625rem] font-semibold px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                                            Utama
                                        </span>
                                    )}
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
                                {editing ? 'Edit Dompet' : 'Tambah Dompet'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Nama Dompet</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="form-control-sneat" placeholder="Contoh: Bank BCA" />
                                </div>
                                <div>
                                    <label className="form-label-sneat">Jenis</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {walletTypes.map((t) => {
                                            const TI = t.icon
                                            const sel = form.type === t.value
                                            return (
                                                <button key={t.value} type="button" onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                                                    className={`flex flex-col items-center gap-1 p-2.5 rounded-md text-xs transition ${
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
                                    <label className="form-label-sneat">Saldo Awal</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
                                        <input type="text" value={form.initial_balance}
                                            onChange={(e) => setForm((f) => ({ ...f, initial_balance: e.target.value.replace(/[^0-9]/g, '') }))}
                                            className="form-control-sneat pl-10 pr-4 py-2.5" placeholder="0" />
                                    </div>
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
                title="Hapus Dompet"
                message={`Hapus dompet ${deleteTarget?.name || ''}? Transaksi terkait tidak akan terhapus.`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
