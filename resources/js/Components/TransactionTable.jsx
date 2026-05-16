import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import CategoryBadge from './CategoryBadge'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

export default function TransactionTable({ transactions = [], loading, sort, onSort, onEdit, onDelete, showActions = true }) {
    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                ))}
            </div>
        )
    }

    if (!transactions.length) {
        return (
            <div className="card-sneat p-10 text-center">
                <p className="text-text-muted dark:text-text-muted-dark">No transactions found</p>
            </div>
        )
    }

    const SortHeader = ({ field, label }) => (
        <th className="px-4 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider cursor-pointer hover:text-text-heading dark:hover:text-text-heading-dark transition" onClick={() => onSort?.(field)}>
            <div className="flex items-center gap-1">
                {label}
                {sort?.field === field && (
                    <span className="text-primary">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                )}
                <ArrowUpDown size={12} className="opacity-40" />
            </div>
        </th>
    )

    return (
        <>
            <div className="hidden md:block card-sneat overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/30">
                        <tr>
                            <SortHeader field="date" label="Date" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Category</th>
                            <SortHeader field="description" label="Description" />
                            <SortHeader field="amount" label="Amount" />
                            {showActions && <th className="px-4 py-3 text-right text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition">
                                <td className="px-4 py-3 text-sm text-text-muted dark:text-text-muted-dark whitespace-nowrap">
                                    {t.date ? new Date(t.date).toLocaleDateString('id-ID') : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <CategoryBadge category={t.category} />
                                    {t.labels?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {t.labels.map((l) => (
                                                <span key={l.id} className="text-[0.625rem] px-1.5 py-0.5 rounded-full text-white"
                                                    style={{ background: l.color }}>
                                                    {l.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-text dark:text-text-dark max-w-[200px] truncate">
                                    {t.description || '-'}
                                </td>
                                <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </td>
                                {showActions && (
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button onClick={() => onEdit(t)} className="p-1.5 rounded-md hover:bg-primary-light/50 text-primary transition">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-md hover:bg-expense/10 text-expense transition">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {transactions.map((t) => (
                    <div key={t.id} className="card-sneat p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <CategoryBadge category={t.category} />
                                {t.labels?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {t.labels.map((l) => (
                                            <span key={l.id} className="text-[0.625rem] px-1.5 py-0.5 rounded-full text-white"
                                                style={{ background: l.color }}>
                                                {l.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-text dark:text-text-dark mt-1">{t.description || '-'}</p>
                            </div>
                            <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted-dark">
                            <span>{t.date ? new Date(t.date).toLocaleDateString('id-ID') : '-'}</span>
                            {showActions && (
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(t)} className="text-primary hover:underline">Edit</button>
                                    <button onClick={() => onDelete(t.id)} className="text-expense hover:underline">Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
