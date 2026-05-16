import { useState, useEffect } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import { Plus, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import DebtCard from '@/Components/DebtCard'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

export default function Debts() {
    const { debts: initialDebts } = usePage().props
    const [debts, setDebts] = useState(initialDebts || [])
    const [modalOpen, setModalOpen] = useState(false)
    const [payModal, setPayModal] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [form, setForm] = useState({ creditor_name: '', total_amount: '', description: '', due_date: '' })
    const [payAmount, setPayAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { setDebts(initialDebts || []) }, [initialDebts])
    useEffect(() => {
        const handler = () => setModalOpen(true)
        window.addEventListener('open-debt-modal', handler)
        return () => window.removeEventListener('open-debt-modal', handler)
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            router.post('/debts', form, {
                onSuccess: () => {
                    toast.success('Utang dibuat')
                    setModalOpen(false)
                    setForm({ creditor_name: '', total_amount: '', description: '', due_date: '' })
                },
                onError: (err) => toast.error(Object.values(err).join(', ')),
                onFinish: () => setSubmitting(false),
            })
        } catch { setSubmitting(false) }
    }

    const handlePay = async () => {
        if (!payModal || !payAmount) return
        setSubmitting(true)
        try {
            router.post(`/debts/${payModal.id}/pay`, { amount: payAmount, notes: '' }, {
                onSuccess: () => { toast.success('Pembayaran dicatat'); setPayModal(null); setPayAmount('') },
                onError: (err) => toast.error(Object.values(err).join(', ')),
                onFinish: () => setSubmitting(false),
            })
        } catch { setSubmitting(false) }
    }

    const handleDelete = () => {
        if (!deleteTarget) return
        router.delete(`/debts/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success('Utang dihapus')
                setDeleteTarget(null)
            },
            onError: () => toast.error('Gagal menghapus'),
        })
    }

    const totalRemaining = debts.filter((d) => d.status === 'unpaid').reduce((s, d) => s + Number(d.remaining_amount), 0)
    const totalAll = debts.reduce((s, d) => s + Number(d.total_amount), 0)
    const totalPaid = totalAll - totalRemaining

    return (
        <AppLayout title="Debts">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Utang</h4>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">{debts.length} catatan utang</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Utang
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-warning">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-warning flex items-center justify-center text-white shadow-sm shrink-0">
                            <Banknote size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Utang</p>
                            <p className="text-lg font-semibold text-text-heading mt-0.5">{formatCurrency(totalAll)}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card-sneat card-accent-top accent-income">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-income flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Terbayar</p>
                            <p className="text-lg font-semibold text-income mt-0.5">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card-sneat card-accent-top accent-expense">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-icon-expense flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowDownRight size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Sisa</p>
                            <p className="text-lg font-semibold text-expense mt-0.5">{formatCurrency(totalRemaining)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {debts.length === 0 ? (
                    <div className="card-sneat">
                        <EmptyState title="Belum ada catatan utang" description="Mulai dengan menambahkan utang pertama Anda" />
                    </div>
                ) : (
                    debts.map((debt) => (
                        <DebtCard key={debt.id} debt={debt} onPay={setPayModal} onDelete={setDeleteTarget} />
                    ))
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
                    <div className="card-sneat p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">Tambah Utang Baru</h5>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="form-label-sneat">Nama Kreditur</label>
                                <input type="text" value={form.creditor_name} onChange={(e) => setForm((f) => ({ ...f, creditor_name: e.target.value }))}
                                    className="form-control-sneat" required />
                            </div>
                            <div>
                                <label className="form-label-sneat">Jumlah Total</label>
                                <input type="number" min="0" step="0.01" value={form.total_amount} onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
                                    className="form-control-sneat" required />
                            </div>
                            <div>
                                <label className="form-label-sneat">Deskripsi</label>
                                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    className="form-control-sneat" rows={2} />
                            </div>
                            <div>
                                <label className="form-label-sneat">Tanggal Jatuh Tempo</label>
                                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                                    className="form-control-sneat" required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="btn-outline-sneat flex-1 py-2.5 text-sm">Batal</button>
                                <button type="submit" disabled={submitting}
                                    className="btn-primary-sneat flex-1 py-2.5 text-sm">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {payModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPayModal(null)}>
                    <div className="card-sneat p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-2">Bayar Utang</h5>
                        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">
                            {payModal.creditor_name} — Sisa: {formatCurrency(payModal.remaining_amount)}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label-sneat">Jumlah Pembayaran</label>
                                <input type="number" min="0" step="0.01" max={payModal.remaining_amount} value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="form-control-sneat" required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setPayModal(null)}
                                    className="btn-outline-sneat flex-1 py-2.5 text-sm">Batal</button>
                                <button onClick={handlePay} disabled={submitting || !payAmount}
                                    className="btn-primary-sneat flex-1 py-2.5 text-sm">{submitting ? 'Memproses...' : 'Bayar'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Utang"
                message={`Apakah Anda yakin ingin menghapus utang ke ${deleteTarget?.creditor_name || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
