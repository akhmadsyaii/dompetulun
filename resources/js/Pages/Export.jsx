import { useState, useRef } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Download, Upload, FileSpreadsheet, FileText, Archive } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'

export default function Export() {
    const fileInputRef = useRef(null)
    const [importing, setImporting] = useState(false)

    const handleExportJSON = async () => {
        try {
            const res = await axios.get('/export/backup', { responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = `dompetulun-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Data exported')
        } catch {
            toast.error('Export failed')
        }
    }

    const handleExportExcel = async () => {
        try {
            const res = await axios.get('/export/excel', { responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = `dompetulun-export-${new Date().toISOString().split('T')[0]}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Excel exported')
        } catch {
            toast.error('Export failed')
        }
    }

    const handleExportPDF = async () => {
        try {
            const res = await axios.get('/export/pdf', { responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = `dompetulun-report-${new Date().toISOString().split('T')[0]}.pdf`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('PDF exported')
        } catch {
            toast.error('Export failed')
        }
    }

    const handleImport = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImporting(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            await axios.post('/export/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            toast.success('Data imported successfully')
        } catch {
            toast.error('Import failed')
        }
        setImporting(false)
        e.target.value = ''
    }

    return (
        <AppLayout title="Export / Import">
            <Head title="Export / Import" />
            <div className="max-w-2xl space-y-5">
                <div className="card-sneat p-5">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-1">Export Data</h5>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark mb-5">Download your financial data in various formats.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button onClick={handleExportJSON}
                            className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border dark:border-border-dark hover:border-primary hover:bg-primary-light/30 transition cursor-pointer">
                            <Archive size={28} className="text-primary" />
                            <span className="text-sm font-medium text-text-heading dark:text-text-heading-dark">JSON Backup</span>
                            <span className="text-xs text-text-muted">Full data export</span>
                        </button>
                        <button onClick={handleExportExcel}
                            className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border dark:border-border-dark hover:border-primary hover:bg-primary-light/30 transition cursor-pointer">
                            <FileSpreadsheet size={28} className="text-income" />
                            <span className="text-sm font-medium text-text-heading dark:text-text-heading-dark">Excel</span>
                            <span className="text-xs text-text-muted">Spreadsheet format</span>
                        </button>
                        <button onClick={handleExportPDF}
                            className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border dark:border-border-dark hover:border-primary hover:bg-primary-light/30 transition cursor-pointer">
                            <FileText size={28} className="text-expense" />
                            <span className="text-sm font-medium text-text-heading dark:text-text-heading-dark">PDF Report</span>
                            <span className="text-xs text-text-muted">Printable report</span>
                        </button>
                    </div>
                </div>

                <div className="card-sneat p-5">
                    <div className="flex items-center gap-3">
                        <Upload size={20} className="text-text-muted" />
                        <div className="flex-1">
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Import Data</h5>
                            <p className="text-sm text-text-muted dark:text-text-muted-dark">Restore your data from a JSON backup file.</p>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                            className="btn-primary-sneat text-sm">
                            {importing ? 'Importing...' : 'Choose File'}
                        </button>
                        <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
