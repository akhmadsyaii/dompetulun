import { Head, Link } from '@inertiajs/react'
import { Home } from 'lucide-react'

export default function Error({ status }) {
    const title = status === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan'
    const desc = status === 404
        ? 'Halaman yang Anda cari tidak ada atau telah dipindahkan.'
        : 'Maaf, terjadi kesalahan pada server.'
    const code = status || 500

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex items-center justify-center px-4 bg-surface dark:bg-surface-dark">
                <div className="text-center max-w-md">
                    <p className="text-7xl font-bold text-primary mb-2">{code}</p>
                    <h1 className="text-xl font-semibold text-text-heading dark:text-text-heading-dark mb-2">{title}</h1>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark mb-8">{desc}</p>
                    <Link href="/dashboard"
                        className="btn-primary-sneat px-6 py-2.5 text-sm">
                        <Home size={16} /> Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </>
    )
}
