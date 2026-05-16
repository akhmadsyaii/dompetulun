import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Target, TrendingUp, PiggyBank, Home, Car, Plane, GraduationCap, Heart, Gift, Settings2, Percent, DollarSign, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import ConfirmModal from '@/Components/ConfirmModal'
import EmptyState from '@/Components/EmptyState'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const iconOptions = [
    { value: 'piggy-bank', icon: PiggyBank, label: 'Celengan' },
    { value: 'home', icon: Home, label: 'Rumah' },
    { value: 'car', icon: Car, label: 'Mobil' },
    { value: 'plane', icon: Plane, label: 'Liburan' },
    { value: 'graduation', icon: GraduationCap, label: 'Pendidikan' },
    { value: 'heart', icon: Heart, label: 'Kesehatan' },
    { value: 'gift', icon: Gift, label: 'Hadiah' },
    { value: 'trending-up', icon: TrendingUp, label: 'Investasi' },
    { value: 'target', icon: Target, label: 'Lainnya' },
]

const colorOptions = [
    { value: '#696cff', label: 'Ungu' },
    { value: '#28c76f', label: 'Hijau' },
    { value: '#ea5455', label: 'Merah' },
    { value: '#ff9f43', label: 'Oranye' },
    { value: '#00cfe8', label: 'Biru' },
]

function GoalCircle({ progress, color, size = 80 }) {
    const r = 34
    const circumference = 2 * Math.PI * r
    const offset = circumference - (progress / 100) * circumference

    return (
        <svg width={size} height={size} viewBox="0 0 80 80" className="shrink-0">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="600" fill="currentColor" className="dark:fill-white">
                {progress}%
            </text>
        </svg>
    )
}

function getIcon(name) {
    const found = iconOptions.find((o) => o.value === name)
    if (found) return found.icon
    return Target
}

export default function Goals() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '', icon: 'piggy-bank', color: '#696cff' })
    const [submitting, setSubmitting] = useState(false)

    const fetchData = () => {
        setLoading(true)
        axios.get('/goals/data')
            .then((res) => setGoals(res.data || []))
            .catch(() => toast.error('Gagal memuat target'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', target_amount: '', current_amount: '', deadline: '', icon: 'piggy-bank', color: '#696cff' })
        setModalOpen(true)
    }

    const openEdit = (g) => {
        setEditing(g)
        setForm({ name: g.name, target_amount: String(g.target_amount), current_amount: String(g.current_amount), deadline: g.deadline || '', icon: g.icon || 'piggy-bank', color: g.color || '#696cff' })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (submitting) return
        if (!form.name || !form.target_amount) { toast.error('Lengkapi semua field'); return }
        setSubmitting(true)
        try {
            const payload = {
                name: form.name,
                target_amount: Number(form.target_amount.replace(/[^0-9]/g, '')),
                current_amount: Number(form.current_amount.replace(/[^0-9]/g, '')),
                deadline: form.deadline || null,
                icon: form.icon,
                color: form.color,
            }
            if (editing) {
                const res = await axios.put(`/goals/${editing.id}`, payload)
                toast.success(res.data.message)
            } else {
                const res = await axios.post('/goals', payload)
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
        axios.delete(`/goals/${deleteTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteTarget(null); fetchData() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const [rules, setRules] = useState([])
    const [rulesModalOpen, setRulesModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState(null)
    const [deleteRuleTarget, setDeleteRuleTarget] = useState(null)
    const [ruleForm, setRuleForm] = useState({ goal_id: '', type: 'percentage', value: '' })
    const [ruleSubmitting, setRuleSubmitting] = useState(false)

    const fetchRules = () => {
        axios.get('/funding-rules')
            .then((res) => setRules(res.data || []))
            .catch(() => {})
    }

    useEffect(() => { fetchRules() }, [])

    const openCreateRule = () => {
        setEditingRule(null)
        setRuleForm({ goal_id: goals[0]?.id || '', type: 'percentage', value: '' })
        setRulesModalOpen(true)
    }

    const openEditRule = (r) => {
        setEditingRule(r)
        setRuleForm({ goal_id: r.goal_id, type: r.type, value: String(r.value) })
        setRulesModalOpen(true)
    }

    const handleSaveRule = async () => {
        if (ruleSubmitting) return
        if (!ruleForm.goal_id || !ruleForm.value) { toast.error('Lengkapi semua field'); return }
        setRuleSubmitting(true)
        try {
            const payload = { goal_id: Number(ruleForm.goal_id), type: ruleForm.type, value: Number(ruleForm.value.replace(/[^0-9.]/g, '')) }
            if (editingRule) {
                await axios.put(`/funding-rules/${editingRule.id}`, payload)
                toast.success('Aturan diperbarui')
            } else {
                await axios.post('/funding-rules', payload)
                toast.success('Aturan ditambahkan')
            }
            setRulesModalOpen(false)
            fetchRules()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan')
        } finally {
            setRuleSubmitting(false)
        }
    }

    const handleDeleteRule = () => {
        if (!deleteRuleTarget) return
        axios.delete(`/funding-rules/${deleteRuleTarget.id}`)
            .then((res) => { toast.success(res.data.message); setDeleteRuleTarget(null); fetchRules() })
            .catch(() => toast.error('Gagal menghapus'))
    }

    const now = new Date()

    return (
        <AppLayout title="Target">
            <Head title="Target" />

            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">Target Keuangan</h4>
                <button onClick={openCreate} className="btn-primary-sneat px-4 py-2 text-sm">
                    <Plus size={17} /> Tambah Target
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="card-sneat p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mx-auto mb-3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
                        </div>
                    ))}
                </div>
            ) : goals.length === 0 ? (
                <div className="card-sneat">
                    <EmptyState title="Belum ada target" description="Buat target keuangan untuk masa depan" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {goals.map((g) => {
                        const pct = Number(g.progress || 0)
                        const Icon = getIcon(g.icon)
                        const overdue = g.deadline && new Date(g.deadline) < now && pct < 100
                        return (
                            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="card-sneat p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                                            style={{ background: g.color || '#696cff' }}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">{g.name}</h6>
                                            {g.deadline && (
                                                <p className={`text-xs mt-0.5 ${overdue ? 'text-expense font-medium' : 'text-text-muted'}`}>
                                                    {overdue ? 'Tenggat: ' : ''}{new Date(g.deadline).toLocaleDateString('id-ID')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition"><Pencil size={15} /></button>
                                        <button onClick={() => setDeleteTarget(g)} className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <GoalCircle progress={pct} color={g.color || '#696cff'} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-text-muted">Terkumpul</span>
                                            <span className="text-xs font-medium text-text-heading">{formatCurrency(g.current_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-text-muted">Target</span>
                                            <span className="text-xs font-medium text-text-heading">{formatCurrency(g.target_amount)}</span>
                                        </div>
                                        {g.remaining > 0 && (
                                            <p className="text-xs text-text-muted mt-2">
                                                Sisa {formatCurrency(g.remaining)}
                                            </p>
                                        )}
                                        {pct >= 100 && (
                                            <span className="inline-block mt-2 text-xs font-semibold text-income bg-income/10 px-2 py-0.5 rounded-full">Tercapai!</span>
                                        )}
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
                                {editing ? 'Edit Target' : 'Tambah Target'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Nama Target</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="form-control-sneat" placeholder="Contoh: Liburan ke Bali" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label-sneat">Target</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">Rp</span>
                                            <input type="text" value={form.target_amount}
                                                onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value.replace(/[^0-9]/g, '') }))}
                                                className="form-control-sneat pl-8 pr-3 py-2.5" placeholder="0" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label-sneat">Terkumpul</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">Rp</span>
                                            <input type="text" value={form.current_amount}
                                                onChange={(e) => setForm((f) => ({ ...f, current_amount: e.target.value.replace(/[^0-9]/g, '') }))}
                                                className="form-control-sneat pl-8 pr-3 py-2.5" placeholder="0" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Tenggat (opsional)</label>
                                    <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                                        className="form-control-sneat" />
                                </div>
                                <div>
                                    <label className="form-label-sneat">Ikon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map((o) => {
                                            const I = o.icon
                                            const sel = form.icon === o.value
                                            return (
                                                <button key={o.value} type="button" onClick={() => setForm((f) => ({ ...f, icon: o.value }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition ${sel ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-text-muted hover:bg-primary-light/50 hover:text-primary'}`}>
                                                    <I size={14} /> {o.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Warna</label>
                                    <div className="flex gap-2">
                                        {colorOptions.map((o) => (
                                            <button key={o.value} type="button" onClick={() => setForm((f) => ({ ...f, color: o.value }))}
                                                className={`w-8 h-8 rounded-full transition-all ${form.color === o.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                                                style={{ background: o.value }} title={o.label} />
                                        ))}
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

            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings2 size={18} className="text-primary" />
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Aturan Auto-Funding</h5>
                    </div>
                    <button onClick={openCreateRule} disabled={goals.length === 0}
                        className="btn-primary-sneat px-3 py-1.5 text-xs disabled:opacity-40">
                        <Plus size={14} /> Tambah Aturan
                    </button>
                </div>
                {goals.length === 0 ? (
                    <p className="text-sm text-text-muted">Buat target terlebih dahulu untuk menambahkan aturan funding.</p>
                ) : rules.length === 0 ? (
                    <p className="text-sm text-text-muted">Belum ada aturan. Atur funding otomatis untuk menabung secara konsisten.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rules.map((r) => (
                            <div key={r.id} className="card-sneat p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm ${r.active ? 'bg-primary' : 'bg-gray-400'}`}>
                                            {r.type === 'percentage' ? <Percent size={16} /> : r.type === 'roundup' ? <RotateCcw size={16} /> : <DollarSign size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-heading dark:text-text-heading-dark">
                                                {r.type === 'percentage' ? `${r.value}% dari pemasukan` : r.type === 'roundup' ? `Bulatkan ke Rp ${Number(r.value).toLocaleString('id-ID')}` : `Rp ${Number(r.value).toLocaleString('id-ID')}/bulan`}
                                            </p>
                                            <p className="text-xs text-text-muted">Target: {r.goal_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditRule(r)} className="p-1 rounded-md hover:bg-primary-light/50 text-primary transition"><Pencil size={13} /></button>
                                        <button onClick={() => setDeleteRuleTarget(r)} className="p-1 rounded-md hover:bg-expense/10 text-expense transition"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {rulesModalOpen && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial="hidden" animate="visible" exit="hidden"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRulesModalOpen(false)}>
                        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} initial="hidden" animate="visible" exit="hidden"
                            className="card-sneat p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">
                                {editingRule ? 'Edit Aturan' : 'Tambah Aturan Funding'}
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label-sneat">Target</label>
                                    <select value={ruleForm.goal_id} onChange={(e) => setRuleForm((f) => ({ ...f, goal_id: e.target.value }))}
                                        className="form-control-sneat">
                                        <option value="">Pilih target</option>
                                        {goals.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label-sneat">Tipe Aturan</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'percentage', label: 'Persentase', icon: Percent },
                                            { value: 'roundup', label: 'Bulatkan', icon: RotateCcw },
                                            { value: 'fixed', label: 'Tetap', icon: DollarSign },
                                        ].map((t) => {
                                            const TI = t.icon
                                            const sel = ruleForm.type === t.value
                                            return (
                                                <button key={t.value} type="button" onClick={() => setRuleForm((f) => ({ ...f, type: t.value }))}
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
                                    <label className="form-label-sneat">
                                        {ruleForm.type === 'percentage' ? 'Persentase (%)' : ruleForm.type === 'roundup' ? 'Nominal Pembulatan (Rp)' : 'Jumlah Tetap (Rp)'}
                                    </label>
                                    <div className="relative">
                                        {ruleForm.type !== 'percentage' && (
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
                                        )}
                                        <input type="text" value={ruleForm.value}
                                            onChange={(e) => setRuleForm((f) => ({ ...f, value: e.target.value.replace(/[^0-9]/g, '') }))}
                                            className={`form-control-sneat py-2.5 ${ruleForm.type !== 'percentage' ? 'pl-10' : ''}`}
                                            placeholder={ruleForm.type === 'percentage' ? 'Contoh: 10' : '0'} />
                                        {ruleForm.type === 'percentage' && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setRulesModalOpen(false)} className="btn-outline-sneat flex-1 py-2.5 text-sm">Batal</button>
                                    <button onClick={handleSaveRule} disabled={ruleSubmitting}
                                        className="btn-primary-sneat flex-1 py-2.5 text-sm">{ruleSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
                title="Hapus Target"
                message={`Hapus target ${deleteTarget?.name || ''}?`}
                confirmText="Hapus"
                variant="danger"
            />

            <ConfirmModal
                isOpen={!!deleteRuleTarget}
                onClose={() => setDeleteRuleTarget(null)}
                onConfirm={handleDeleteRule}
                title="Hapus Aturan"
                message="Hapus aturan funding ini?"
                confirmText="Hapus"
                variant="danger"
            />
        </AppLayout>
    )
}
