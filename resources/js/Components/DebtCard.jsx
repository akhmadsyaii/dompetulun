import { useState } from 'react'
import { ChevronDown, ChevronUp, Banknote, Trash2 } from 'lucide-react'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function getStatus(debt) {
    const total = Number(debt.total_amount) || 1
    const remaining = Number(debt.remaining_amount) || 0
    const paid = total - remaining
    const percent = Math.round((paid / total) * 100)

    if (percent >= 100) return { label: 'Lunas', color: 'bg-income/10', textColor: 'text-income', percent: 100 }

    if (debt.due_date) {
        const due = new Date(debt.due_date)
        const now = new Date()
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        if (diffDays < 0) return { label: 'Terlambat', color: 'bg-expense/10', textColor: 'text-expense', percent, days: Math.abs(diffDays) }
        if (diffDays <= 7) return { label: 'Segera', color: 'bg-warning/10', textColor: 'text-yellow-600 dark:text-yellow-400', percent, days: diffDays }
        return { label: 'Aktif', color: 'bg-primary/10', textColor: 'text-primary', percent, days: diffDays }
    }
    return { label: 'Aktif', color: 'bg-primary/10', textColor: 'text-primary', percent }
}

export default function DebtCard({ debt, onPay, onDelete }) {
    const [showHistory, setShowHistory] = useState(false)
    const status = getStatus(debt)
    const total = Number(debt.total_amount) || 0
    const remaining = Number(debt.remaining_amount) || 0
    const paid = total - remaining
    const payments = debt.debt_payments || []

    return (
        <div className="card-sneat p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Banknote size={18} className="text-text-muted dark:text-text-muted-dark" />
                        <h3 className="font-semibold text-text-heading dark:text-text-heading-dark">{debt.creditor_name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color} ${status.textColor}`}>
                            {status.label}
                        </span>
                    </div>
                    {debt.description && (
                        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-2">{debt.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <span className="text-text-muted dark:text-text-muted-dark">Total: <strong className="text-text-heading dark:text-text-heading-dark">{formatCurrency(total)}</strong></span>
                        <span className="text-text-muted dark:text-text-muted-dark">Paid: <strong className="text-income">{formatCurrency(paid)}</strong></span>
                        <span className="text-text-muted dark:text-text-muted-dark">Remaining: <strong className="text-expense">{formatCurrency(remaining)}</strong></span>
                        {debt.due_date && (
                            <span className="text-text-muted dark:text-text-muted-dark">
                                Due: {new Date(debt.due_date).toLocaleDateString('id-ID')}
                                {status.days !== undefined && ` (${status.days}d)`}
                            </span>
                        )}
                    </div>
                </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {status.percent < 100 && (
                            <button onClick={() => onPay(debt)} className="btn-primary-sneat text-sm px-3 py-1.5 whitespace-nowrap">
                                Pay
                            </button>
                        )}
                        <button onClick={() => onDelete(debt)} className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition">
                            <Trash2 size={16} />
                        </button>
                    </div>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted-dark mb-1">
                    <span>{status.percent}% paid</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${status.color}`} style={{ width: `${Math.min(status.percent, 100)}%` }} />
                </div>
            </div>

            {payments.length > 0 && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 text-sm text-text-muted dark:text-text-muted-dark hover:text-text-heading dark:hover:text-text-heading-dark transition">
                        {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        Payment History ({payments.length})
                    </button>
                    {showHistory && (
                        <div className="mt-2 space-y-1.5">
                            {payments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-1.5 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <span className="text-text-muted dark:text-text-muted-dark">{new Date(p.paid_at || p.created_at).toLocaleDateString('id-ID')}</span>
                                    <span className="font-medium text-income">{formatCurrency(p.amount)}</span>
                                    {p.notes && <span className="text-text-muted dark:text-text-muted-dark text-xs">{p.notes}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
