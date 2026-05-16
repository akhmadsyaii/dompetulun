import { useState, useEffect, useCallback } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Search } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import TransactionTable from '@/Components/TransactionTable'
import TransactionForm from '@/Components/TransactionForm'
import DateRangePicker from '@/Components/DateRangePicker'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'
import { allCategories } from '@/Components/CategoryBadge'

const categories = [...allCategories.income, ...allCategories.expense].map((c) => ({ value: c.value, label: c.label, icon: c.icon.name }))

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [meta, setMeta] = useState(null)
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [filters, setFilters] = useState({ start_date: '', end_date: '', category: '', type: '', search: '', page: 1 })
    const [sort, setSort] = useState({ field: 'date', dir: 'desc' })
    const [deleteTarget, setDeleteTarget] = useState(null)

    const fetchData = useCallback(() => {
        setLoading(true)
        const params = { ...filters, sort_field: sort.field, sort_dir: sort.dir }
        axios.get('/transactions/data', { params })
            .then((res) => {
                setTransactions(res.data.data || [])
                setMeta(res.data.meta || null)
            })
            .catch(() => toast.error('Gagal memuat transaksi'))
            .finally(() => setLoading(false))
    }, [filters, sort])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        const handler = () => fetchData()
        window.addEventListener('refresh-data', handler)
        return () => window.removeEventListener('refresh-data', handler)
    }, [fetchData])

    const handleSave = (formData) => {
        const request = editing
            ? axios.put(`/transactions/${editing.id}`, formData)
            : axios.post('/transactions', formData)

        return request
            .then(() => {
                toast.success(editing ? 'Transaksi diperbarui' : 'Transaksi dibuat')
                setModalOpen(false)
                setEditing(null)
                fetchData()
            })
            .catch((err) => toast.error(err.response?.data?.message || 'Terjadi kesalahan'))
    }

    const handleDelete = () => {
        if (!deleteTarget) return
        axios.delete(`/transactions/${deleteTarget}`)
            .then(() => {
                toast.success('Transaksi dihapus')
                setDeleteTarget(null)
                fetchData()
            })
            .catch((err) => toast.error(err.response?.status === 419 ? 'Sesi habis, refresh halaman' : 'Gagal menghapus'))
    }

    const handleSort = (field) => {
        setSort((prev) => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }))
    }

    const openEdit = (t) => { setEditing(t); setModalOpen(true) }

    return (
        <AppLayout title="Transactions">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Transactions</h4>
                <button onClick={() => { setEditing(null); setModalOpen(true) }}
                    className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Transaksi
                </button>
            </div>

            <div className="card-sneat p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                    <DateRangePicker
                        startDate={filters.start_date}
                        endDate={filters.end_date}
                        onChange={(sd, ed) => setFilters((prev) => ({ ...prev, start_date: sd, end_date: ed }))}
                    />
                    <div className="w-full sm:w-auto">
                        <label className="form-label-sneat">Kategori</label>
                        <select value={filters.category}
                            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                            className="form-control-sneat py-2 text-sm w-full sm:w-auto sm:min-w-[130px]">
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="form-label-sneat">Tipe</label>
                        <select value={filters.type}
                            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                            className="form-control-sneat py-2 text-sm w-full sm:w-auto sm:min-w-[100px]">
                            <option value="">Semua</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                    <div className="relative flex-1 w-full sm:w-auto sm:min-w-[160px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="text" placeholder="Cari..."
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            className="form-control-sneat pl-9 pr-3 py-2 text-sm" />
                    </div>
                </div>
            </div>

            {!loading && transactions.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState title="Belum ada transaksi" description="Mulai dengan menambahkan transaksi pertama Anda" />
                </div>
            ) : (
                <TransactionTable
                    transactions={transactions}
                    loading={loading}
                    sort={sort}
                    onSort={handleSort}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    showActions
                />
            )}

            {meta && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-text-muted dark:text-text-muted-dark">
                        Halaman {meta.current_page} dari {meta.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button disabled={!meta.prev_page_url}
                            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                            className="btn-outline-sneat px-3 py-1.5 text-sm disabled:opacity-40">
                            Sebelumnya
                        </button>
                        <button disabled={!meta.next_page_url}
                            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                            className="btn-outline-sneat px-3 py-1.5 text-sm disabled:opacity-40">
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            <TransactionForm
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null) }}
                transaction={editing}
                onSave={handleSave}
            />

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Transaksi"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
