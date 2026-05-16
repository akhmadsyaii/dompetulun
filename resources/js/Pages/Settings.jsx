import { useState, useRef } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Sun, Moon, Download, Upload, Trash2, User, Shield, Eye, EyeOff } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import useLocalStorage from '@/Hooks/useLocalStorage'

const currencies = [
    { value: 'IDR', label: 'Rp - Indonesian Rupiah' },
    { value: 'USD', label: '$ - US Dollar' },
    { value: 'EUR', label: '€ - Euro' },
]

export default function Settings() {
    const { auth, errors: serverErrors } = usePage().props
    const user = auth?.user
    const [dark, setDark] = useLocalStorage('theme', false)
    const fileInputRef = useRef(null)

    const [name, setName] = useState(user?.name || '')
    const [currency, setCurrency] = useState(user?.currency || 'IDR')
    const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const handleSaveProfile = async () => {
        setSaving(true)
        setErrors({})
        router.post('/settings/update', { name, currency }, {
            onSuccess: () => {
                toast.success('Profil diperbarui')
                setErrors({})
            },
            onError: (errs) => {
                setErrors(errs)
                toast.error('Gagal menyimpan profil')
            },
            onFinish: () => setSaving(false),
        })
    }

    const handleChangePassword = (e) => {
        e.preventDefault()
        if (passwordForm.password !== passwordForm.password_confirmation) {
            setErrors({ password_confirmation: 'Password tidak cocok' })
            return
        }
        setPwSaving(true)
        setErrors({})
        router.post('/settings/change-password', passwordForm, {
            onSuccess: () => {
                toast.success('Password berhasil diubah')
                setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
                setShowPassword(false)
                setErrors({})
            },
            onError: (errs) => {
                setErrors(errs)
                toast.error('Gagal mengubah password')
            },
            onFinish: () => setPwSaving(false),
        })
    }

    const toggleDark = () => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        router.post('/settings/toggle-dark-mode')
    }

    const handleExport = async () => {
        try {
            const res = await axios.get('/export/backup', { responseType: 'blob' })
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = `dompetulun-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Data berhasil diexport')
        } catch { toast.error('Export gagal') }
    }

    const handleImport = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        try {
            await axios.post('/export/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            toast.success('Data berhasil diimport')
        } catch { toast.error('Import gagal') }
        e.target.value = ''
    }

    const handleReset = () => {
        if (!confirm('Apakah Anda yakin? Semua data akan dihapus permanen.')) return
        if (!confirm('Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) return
        router.post('/settings/reset-data')
            .then(() => toast.success('Semua data telah direset'))
            .catch(() => toast.error('Reset gagal'))
    }

    const fieldError = (key) => {
        const msg = errors[key] || serverErrors?.[key]
        return msg ? <p className="text-expense text-xs mt-1.5">{msg}</p> : null
    }

    return (
        <AppLayout title="Settings">
            <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark mb-6">Pengaturan</h4>

            <div className="space-y-5 max-w-2xl">
                <div className="card-sneat p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={18} className="text-text-muted dark:text-text-muted-dark" />
                        <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Profil</h5>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label-sneat">Nama</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className={`form-control-sneat ${fieldError('name') ? '!border-expense' : ''}`} />
                            {fieldError('name')}
                        </div>
                        <div>
                            <label className="form-label-sneat">Email</label>
                            <input type="email" value={user?.email || ''} readOnly
                                className="form-control-sneat opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Email tidak dapat diubah</p>
                        </div>
                        <div>
                            <label className="form-label-sneat">Mata Uang</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                                className={`form-control-sneat ${fieldError('currency') ? '!border-expense' : ''}`}>
                                {currencies.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            {fieldError('currency')}
                        </div>
                        <button onClick={handleSaveProfile} disabled={saving}
                            className="btn-primary-sneat px-5 py-2 text-sm">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    </div>
                </div>

                <div className="card-sneat p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-text-muted dark:text-text-muted-dark" />
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">Password</h5>
                        </div>
                        <button onClick={() => setShowPassword(!showPassword)}
                            className="text-sm text-primary hover:underline flex items-center gap-1">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            {showPassword ? 'Batal' : 'Ubah'}
                        </button>
                    </div>
                    {showPassword && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="form-label-sneat">Password Saat Ini</label>
                                <input type="password" value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                                    className={`form-control-sneat ${fieldError('current_password') ? '!border-expense' : ''}`} required />
                                {fieldError('current_password')}
                            </div>
                            <div>
                                <label className="form-label-sneat">Password Baru</label>
                                <input type="password" value={passwordForm.password}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                                    className={`form-control-sneat ${fieldError('password') ? '!border-expense' : ''}`} required />
                                {fieldError('password')}
                            </div>
                            <div>
                                <label className="form-label-sneat">Konfirmasi Password Baru</label>
                                <input type="password" value={passwordForm.password_confirmation}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                                    className={`form-control-sneat ${fieldError('password_confirmation') ? '!border-expense' : ''}`} required />
                                {fieldError('password_confirmation')}
                            </div>
                            <button type="submit" disabled={pwSaving}
                                className="btn-primary-sneat w-full py-2 text-sm">{pwSaving ? 'Mengubah...' : 'Ubah Password'}</button>
                        </form>
                    )}
                </div>

                <div className="card-sneat p-5">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">Tampilan</h5>
                    <div className="flex items-center justify-between">
                        <span className="text-text-muted dark:text-text-muted-dark">Mode Gelap</span>
                        <button onClick={toggleDark}
                            className={`relative w-11 h-5.5 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm flex items-center justify-center transition-transform ${dark ? 'translate-x-5.5' : ''}`}>
                                {dark ? <Sun size={10} className="text-yellow-500" /> : <Moon size={10} className="text-gray-500" />}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="card-sneat p-5">
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark mb-4">Backup & Restore</h5>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={handleExport} className="btn-primary-sneat px-4 py-2 text-sm">
                            <Download size={16} /> Export JSON
                        </button>
                        <button onClick={() => fileInputRef.current?.click()}
                            className="btn-outline-sneat px-4 py-2 text-sm">
                            <Upload size={16} /> Import JSON
                        </button>
                        <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
                    </div>
                </div>

                <div className="card-sneat p-5 border border-expense/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Trash2 size={18} className="text-expense" />
                        <h5 className="text-base font-semibold text-expense">Zona Bahaya</h5>
                    </div>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Hapus permanen semua data Anda. Tindakan ini tidak dapat dibatalkan.</p>
                    <button onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-expense text-white text-sm rounded-md font-medium hover:bg-red-600 transition shadow-sm">
                        <Trash2 size={16} /> Reset Semua Data
                    </button>
                </div>
            </div>
        </AppLayout>
    )
}
