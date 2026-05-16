import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, FileText, X, ExternalLink, Trash2, ArrowLeftRight } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import EmptyState from '@/Components/EmptyState'
import ConfirmModal from '@/Components/ConfirmModal'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

export default function Receipts() {
    const [receipts, setReceipts] = useState([])
    const [loading, setLoading] = useState(true)
    const [preview, setPreview] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const fetchData = () => {
        setLoading(true)
        axios.get('/receipts/data')
            .then((res) => setReceipts(res.data || []))
            .catch(() => toast.error('Gagal memuat struk'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = () => {
        if (!deleteTarget) return
        axios.delete(`/receipts/${deleteTarget.transaction_id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    return (
        <AppLayout title="Struk">
            <Head title="Struk" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Galeri Struk</h4>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                        {receipts.length} struk tersimpan
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card-sneat p-4 animate-pulse">
                            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : receipts.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState icon={Image} title="Belum ada struk" description="Upload struk saat menambahkan transaksi" />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {receipts.map((r) => (
                        <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="card-sneat overflow-hidden group cursor-pointer"
                            onClick={() => setPreview(r)}
                        >
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                {r.attachment?.match(/\.(jpg|jpeg|png)$/i) ? (
                                    <img src={r.attachment} alt={r.description || 'Struk'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <FileText size={40} className="text-text-muted" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-semibold text-text-heading dark:text-text-heading-dark truncate">
                                    {r.description || r.category}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {formatCurrency(r.amount)}
                                </p>
                                <p className="text-[0.625rem] text-text-muted">
                                    {r.date ? new Date(r.date).toLocaleDateString('id-ID') : '-'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {preview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setPreview(null)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setPreview(null)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition">
                                <X size={16} />
                            </button>
                            {preview.attachment?.match(/\.(jpg|jpeg|png)$/i) ? (
                                <img src={preview.attachment} alt="Receipt" className="w-full rounded-xl" />
                            ) : (
                                <div className="card-sneat p-8 text-center">
                                    <FileText size={64} className="mx-auto mb-4 text-text-muted" />
                                    <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark mb-2">
                                        {preview.description || 'Struk'}
                                    </p>
                                    <p className="text-xs text-text-muted mb-4">{formatCurrency(preview.amount)}</p>
                                    {preview.attachment && (
                                        <a href={preview.attachment} target="_blank" rel="noopener noreferrer"
                                            className="btn-primary-sneat inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                                            <ExternalLink size={14} /> Buka File
                                        </a>
                                    )}
                                </div>
                            )}
                            <div className="card-sneat p-4 mt-2 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark capitalize">{preview.category}</p>
                                    <p className="text-xs text-text-muted">{formatCurrency(preview.amount)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href="/transactions" className="p-2 rounded-lg hover:bg-primary-light/50 text-primary transition">
                                        <ArrowLeftRight size={16} />
                                    </Link>
                                    <button onClick={() => { setDeleteTarget(preview); setPreview(null) }}
                                        className="p-2 rounded-lg hover:bg-expense/10 text-expense transition">
                                        <Trash2 size={16} />
                                    </button>
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
                title="Hapus Struk"
                message={`Hapus struk ini?`}
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
