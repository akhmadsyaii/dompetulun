import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Tidak ada data', description = 'Belum ada data untuk ditampilkan.' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Icon size={28} className="text-text-muted dark:text-text-muted-dark" />
            </div>
            <h3 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark mb-1">{title}</h3>
            <p className="text-xs text-text-muted dark:text-text-muted-dark text-center max-w-xs">{description}</p>
        </div>
    )
}
