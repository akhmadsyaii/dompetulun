import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { allCategories } from '@/Components/CategoryBadge'
import { ArrowUpRight, ArrowDownRight, Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'

const colorOptions = [
    '#696cff', '#28c76f', '#ea5455', '#ff9f43', '#00cfe8',
    '#7367f0', '#1e9ff2', '#2ec4b6', '#e73f7a', '#8b5cf6',
]

export default function Categories() {
    const incomeCats = allCategories.income
    const expenseCats = allCategories.expense
    const [labels, setLabels] = useState([])
    const [labelModalOpen, setLabelModalOpen] = useState(false)
    const [editingLabel, setEditingLabel] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [labelForm, setLabelForm] = useState({ name: '', color: '#696cff' })
    const [submitting, setSubmitting] = useState(false)

    const fetchLabels = () => {
        axios.get('/labels')
            .then((res) => setLabels(res.data || []))
            .catch(() => {})
    }

    useEffect(() => { fetchLabels() }, [])

    const openCreateLabel = () => {
        setEditingLabel(null)
        setLabelForm({ name: '', color: '#696cff' })
        setLabelModalOpen(true)
    }

    const openEditLabel = (l) => {
        setEditingLabel(l)
        setLabelForm({ name: l.name, color: l.color })
        setLabelModalOpen(true)
    }

    const handleSaveLabel = async () => {
        if (submitting) return
        if (!labelForm.name) { toast.error('Lengkapi field'); return }
        setSubmitting(true)
        try {
            if (editingLabel) {
                await axios.put(`/labels/${editingLabel.id}`, labelForm)
                toast.success('Label diperbarui')
            } else {
                await axios.post('/labels', labelForm)
                toast.success('Label ditambahkan')
            }
            setLabelModalOpen(false)
            fetchLabels()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteLabel = () => {
        if (!deleteTarget) return
        axios.delete(`/labels/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchLabels() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    return (
        <AppLayout title="Kategori & Label">
            <Head title="Kategori & Label" />
            <div className="max-w-3xl space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Tag size={18} className="text-primary" />
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">
                                Labels ({labels.length})
                            </h5>
                        </div>
                        <button onClick={openCreateLabel} className="btn-primary-sneat px-3 py-1.5 text-xs">
                            <Plus size={14} /> Tambah Label
                        </button>
                    </div>
                    {labels.length === 0 ? (
                        <p className="text-sm text-text-muted">Belum ada label. Tambahkan label untuk mengelompokkan transaksi.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {labels.map((l) => (
                                <div key={l.id} className="card-sneat p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3.5 h-3.5 rounded-full" style={{ background: l.color }} />
                                        <span className="text-sm font-medium text-text-heading dark:text-text-heading-dark">{l.name}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditLabel(l)}
                                            className="p-1 rounded-md hover:bg-primary-light/50 text-primary transition">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => setDeleteTarget(l)}
                                            className="p-1 rounded-md hover:bg-expense/10 text-expense transition">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight size={18} className="text-income" />
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">
                            Income Categories ({incomeCats.length})
                        </h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {incomeCats.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <div key={cat.value}
                                    className="card-sneat card-accent-top accent-income flex items-center gap-3 p-4">
                                    <div className="w-10 h-10 rounded-lg bg-icon-income flex items-center justify-center text-white shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark">{cat.label}</p>
                                        <p className="text-xs text-text-muted">{cat.value}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowDownRight size={18} className="text-expense" />
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">
                            Expense Categories ({expenseCats.length})
                        </h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {expenseCats.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <div key={cat.value}
                                    className="card-sneat card-accent-top accent-expense flex items-center gap-3 p-4">
                                    <div className="w-10 h-10 rounded-lg bg-icon-expense flex items-center justify-center text-white shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark">{cat.label}</p>
                                        <p className="text-xs text-text-muted">{cat.value}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {labelModalOpen && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial="hidden" animate="visible" exit="hidden"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setLabelModalOpen(false)}>
                        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} initial="hidden" animate="visible" exit="hidden"
                            className="card-sneat p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                                {editingLabel ? 'Edit Label' : 'Tambah Label'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Nama Label</label>
                                    <input type="text" value={labelForm.name} onChange={(e) => setLabelForm((f) => ({ ...f, name: e.target.value }))}
                                        className="form-control-sneat" placeholder="Contoh: Penting" />
                                </div>
                                <div>
                                    <label className="form-label-sneat">Warna</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((c) => (
                                            <button key={c} type="button" onClick={() => setLabelForm((f) => ({ ...f, color: c }))}
                                                className={`w-8 h-8 rounded-full transition-all ${labelForm.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                                                style={{ background: c }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setLabelModalOpen(false)} className="btn-outline-sneat flex-1 py-2.5 text-sm">Batal</button>
                                    <button onClick={handleSaveLabel} disabled={submitting}
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
                onConfirm={handleDeleteLabel}
                title="Hapus Label"
                message={`Hapus label ${deleteTarget?.name || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
