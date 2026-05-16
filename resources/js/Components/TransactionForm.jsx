import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    Wallet, Code2, Gift, TrendingUp, UtensilsCrossed, Car,
    ShoppingBag, FileText, Gamepad2, HeartPulse, MoreHorizontal, X,
    BookOpen, Shield, Smartphone, HandHeart, Shirt, Sparkles,
    Tv, Home, Receipt, Building2, DollarSign, Medal, Clock, Feather,
    Landmark, Upload
} from 'lucide-react'

const iconMap = {
    Wallet, Code2, Gift, TrendingUp, UtensilsCrossed, Car,
    ShoppingBag, FileText, Gamepad2, HeartPulse, MoreHorizontal,
    BookOpen, Shield, Smartphone, HandHeart, Shirt, Sparkles,
    Tv, Home, Receipt, Building2, DollarSign, Medal, Clock, Feather,
}

const categoryList = [
    { value: 'gaji', label: 'Gaji', icon: 'Wallet', type: 'income' },
    { value: 'freelance', label: 'Freelance', icon: 'Code2', type: 'income' },
    { value: 'bisnis', label: 'Bisnis', icon: 'Building2', type: 'income' },
    { value: 'penjualan', label: 'Penjualan', icon: 'DollarSign', type: 'income' },
    { value: 'investasi', label: 'Investasi', icon: 'TrendingUp', type: 'income' },
    { value: 'dividen', label: 'Dividen', icon: 'Feather', type: 'income' },
    { value: 'bonus', label: 'Bonus', icon: 'Medal', type: 'income' },
    { value: 'thr', label: 'THR', icon: 'Gift', type: 'income' },
    { value: 'lembur', label: 'Lembur', icon: 'Clock', type: 'income' },
    { value: 'royalti', label: 'Royalti', icon: 'Sparkles', type: 'income' },
    { value: 'hadiah', label: 'Hadiah', icon: 'Gift', type: 'income' },
    { value: 'makan', label: 'Makan', icon: 'UtensilsCrossed', type: 'expense' },
    { value: 'transport', label: 'Transport', icon: 'Car', type: 'expense' },
    { value: 'belanja', label: 'Belanja', icon: 'ShoppingBag', type: 'expense' },
    { value: 'tagihan', label: 'Tagihan', icon: 'FileText', type: 'expense' },
    { value: 'hiburan', label: 'Hiburan', icon: 'Gamepad2', type: 'expense' },
    { value: 'kesehatan', label: 'Kesehatan', icon: 'HeartPulse', type: 'expense' },
    { value: 'pendidikan', label: 'Pendidikan', icon: 'BookOpen', type: 'expense' },
    { value: 'asuransi', label: 'Asuransi', icon: 'Shield', type: 'expense' },
    { value: 'pulsa', label: 'Pulsa', icon: 'Smartphone', type: 'expense' },
    { value: 'donasi', label: 'Donasi', icon: 'HandHeart', type: 'expense' },
    { value: 'pakaian', label: 'Pakaian', icon: 'Shirt', type: 'expense' },
    { value: 'perawatan', label: 'Perawatan', icon: 'Sparkles', type: 'expense' },
    { value: 'elektronik', label: 'Elektronik', icon: 'Tv', type: 'expense' },
    { value: 'rumah', label: 'Rumah', icon: 'Home', type: 'expense' },
    { value: 'pajak', label: 'Pajak', icon: 'Receipt', type: 'expense' },
]

function formatInputCurrency(val) {
    const num = val.replace(/[^0-9]/g, '')
    if (!num) return ''
    return Number(num).toLocaleString('id-ID')
}

export default function TransactionForm({ isOpen, onClose, transaction, onSave }) {
    const [type, setType] = useState('expense')
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [walletId, setWalletId] = useState('')
    const [wallets, setWallets] = useState([])
    const [labelIds, setLabelIds] = useState([])
    const [labels, setLabels] = useState([])
    const [attachment, setAttachment] = useState(null)
    const [attachmentPreview, setAttachmentPreview] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const filteredCategories = categoryList.filter((c) => c.type === type)

    useEffect(() => {
        if (isOpen) {
            axios.get('/wallets/data').then((res) => setWallets(res.data || [])).catch(() => {})
            axios.get('/labels').then((res) => setLabels(res.data || [])).catch(() => {})
        }
    }, [isOpen])

    useEffect(() => {
        if (transaction) {
            setType(transaction.type || 'expense')
            setCategory(transaction.category || '')
            setAmount(formatInputCurrency(String(transaction.amount || '')))
            setDescription(transaction.description || '')
            setDate(transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0])
            setWalletId(transaction.wallet_id ? String(transaction.wallet_id) : '')
            setLabelIds(transaction.labels?.map((l) => l.id) || [])
        } else {
            setType('expense')
            setCategory('')
            setAmount('')
            setDescription('')
            setDate(new Date().toISOString().split('T')[0])
            setWalletId('')
            setLabelIds([])
        }
        setAttachment(null)
        setAttachmentPreview(null)
        setErrors({})
    }, [transaction, isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (submitting) return
        const errs = {}
        if (!category) errs.category = 'Category is required'
        if (!amount) errs.amount = 'Amount is required'
        if (!date) errs.date = 'Date is required'
        if (Object.keys(errs).length) { setErrors(errs); return }

        setSubmitting(true)
        let payload
        if (attachment) {
            payload = new FormData()
            payload.append('type', type)
            payload.append('category', category)
            payload.append('amount', Number(amount.replace(/[^0-9]/g, '')))
            payload.append('description', description)
            payload.append('date', date)
            if (walletId) payload.append('wallet_id', walletId)
            labelIds.forEach((id) => payload.append('label_ids[]', id))
            payload.append('attachment', attachment)
            if (transaction) payload.append('id', transaction.id)
        } else {
            payload = {
                type,
                category,
                amount: Number(amount.replace(/[^0-9]/g, '')),
                description,
                date,
                wallet_id: walletId || null,
                label_ids: labelIds,
            }
            if (transaction) payload.id = transaction.id
        }
        await onSave(payload)
        setSubmitting(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="card-sneat p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">
                                {transaction ? 'Edit Transaction' : 'New Transaction'}
                            </h5>
                            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={18} className="text-text-muted dark:text-text-muted-dark" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button type="button" onClick={() => { setType('expense'); setCategory('') }}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${type === 'expense' ? 'bg-expense text-white shadow-sm' : 'text-text-muted dark:text-text-muted-dark'}`}>
                                    Expense
                                </button>
                                <button type="button" onClick={() => { setType('income'); setCategory('') }}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${type === 'income' ? 'bg-income text-white shadow-sm' : 'text-text-muted dark:text-text-muted-dark'}`}>
                                    Income
                                </button>
                            </div>

                            <div>
                                <label className="form-label-sneat">Category</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {filteredCategories.map((c) => {
                                        const CatIcon = iconMap[c.icon] || MoreHorizontal
                                        const selected = category === c.value
                                        return (
                                            <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition ${
                                                    selected
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-gray-50 dark:bg-gray-800/50 text-text-muted dark:text-text-muted-dark hover:bg-primary-light/50 hover:text-primary'
                                                }`}
                                            >
                                                <CatIcon size={16} />
                                                <span className="leading-tight">{c.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                {errors.category && <p className="text-expense text-xs mt-1">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="form-label-sneat">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-muted-dark text-sm font-medium">Rp</span>
                                    <input type="text" value={amount}
                                        onChange={(e) => setAmount(formatInputCurrency(e.target.value))}
                                        className="form-control-sneat pl-10 pr-4 py-2.5" placeholder="0" />
                                </div>
                                {errors.amount && <p className="text-expense text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="form-label-sneat">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                    rows={2} className="form-control-sneat resize-none" />
                            </div>

                            <div>
                                <label className="form-label-sneat">Struk (opsional)</label>
                                <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary dark:hover:border-primary transition">
                                    <Upload size={18} className="text-text-muted" />
                                    <span className="text-sm text-text-muted">
                                        {attachment ? attachment.name : 'Upload foto struk'}
                                    </span>
                                    <input type="file" accept="image/*,.pdf" className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setAttachment(file)
                                                if (file.type.startsWith('image/')) {
                                                    setAttachmentPreview(URL.createObjectURL(file))
                                                } else {
                                                    setAttachmentPreview(null)
                                                }
                                            }
                                        }} />
                                </label>
                                {attachmentPreview && (
                                    <div className="relative mt-2 inline-block">
                                        <img src={attachmentPreview} alt="Preview" className="h-24 rounded-lg object-cover" />
                                        <button type="button" onClick={() => { setAttachment(null); setAttachmentPreview(null) }}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-expense text-white rounded-full flex items-center justify-center">
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {labels.length > 0 && (
                                <div>
                                    <label className="form-label-sneat">Labels</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {labels.map((l) => {
                                            const sel = labelIds.includes(l.id)
                                            return (
                                                <button key={l.id} type="button" onClick={() =>
                                                    setLabelIds((prev) => sel ? prev.filter((id) => id !== l.id) : [...prev, l.id])
                                                }
                                                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                                                        sel
                                                            ? 'text-white border-transparent'
                                                            : 'border-gray-200 dark:border-gray-700 text-text-muted hover:border-primary'
                                                    }`}
                                                    style={sel ? { background: l.color } : {}}
                                                >
                                                    {l.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="form-label-sneat">Wallet</label>
                                <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
                                    className="form-control-sneat">
                                    <option value="">No wallet</option>
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label-sneat">Date</label>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                    className="form-control-sneat" />
                                {errors.date && <p className="text-expense text-xs mt-1">{errors.date}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="btn-outline-sneat flex-1 py-2.5 text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="btn-primary-sneat flex-1 py-2.5 text-sm">
                                    {submitting ? 'Saving...' : transaction ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
