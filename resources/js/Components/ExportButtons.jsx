import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ExportButtons({ filters = {} }) {
    const handleExport = async (format, filename) => {
        try {
            const res = await axios.get(`/export/${format}`, { params: filters, responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            URL.revokeObjectURL(url)
            toast.success(`Export ${format} berhasil`)
        } catch {
            toast.error(`Gagal export ${format}`)
        }
    }

    return (
        <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleExport('excel', `dompetulun-export-${new Date().toISOString().split('T')[0]}.xlsx`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-income text-white text-sm rounded-md font-medium hover:opacity-90 transition shadow-sm">
                <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={() => handleExport('pdf', `dompetulun-report-${new Date().toISOString().split('T')[0]}.pdf`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm rounded-md font-medium hover:opacity-90 transition shadow-sm">
                <FileText size={16} /> PDF
            </button>
            <button onClick={() => handleExport('backup', `dompetulun-backup-${new Date().toISOString().split('T')[0]}.json`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-warning text-white text-sm rounded-md font-medium hover:opacity-90 transition shadow-sm">
                <Download size={16} /> Backup
            </button>
        </div>
    )
}
