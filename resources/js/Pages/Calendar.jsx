import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '@/Layouts/AppLayout'
import CategoryBadge from '@/Components/CategoryBadge'

function formatCurrency(val) {
    if (val == null) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function Calendar() {
    const now = new Date()
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
    const [currentYear, setCurrentYear] = useState(now.getFullYear())
    const [data, setData] = useState({ daily: [], summary: {} })
    const [loading, setLoading] = useState(true)
    const [selectedDay, setSelectedDay] = useState(null)

    const fetchData = () => {
        setLoading(true)
        axios.get('/calendar/data', { params: { month: currentMonth, year: currentYear } })
            .then((res) => setData(res.data))
            .catch(() => toast.error('Gagal memuat data'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [currentMonth, currentYear])

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1) }
        else setCurrentMonth((m) => m - 1)
    }

    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1) }
        else setCurrentMonth((m) => m + 1)
    }

    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const today = new Date()

    const { daily = [], summary = {} } = data

    const selectedDayData = selectedDay ? daily.find((d) => d.day === selectedDay) : null

    return (
        <AppLayout title="Kalender">
            <Head title="Kalender" />

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-text-heading dark:text-text-heading-dark">
                    Kalender Keuangan
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-sneat card-accent-top accent-income">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pemasukan</p>
                    <p className="text-lg font-semibold text-income">{formatCurrency(summary.total_income)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-expense">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pengeluaran</p>
                    <p className="text-lg font-semibold text-expense">{formatCurrency(summary.total_expense)}</p>
                </div>
                <div className="stat-card-sneat card-accent-top accent-primary">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Bersih</p>
                    <p className={`text-lg font-semibold ${(summary.net || 0) >= 0 ? 'text-income' : 'text-expense'}`}>
                        {formatCurrency(summary.net)}
                    </p>
                </div>
            </div>

            <div className="card-sneat p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <ChevronLeft size={18} className="text-text-muted" />
                    </button>
                    <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">
                        {monthNames[currentMonth - 1]} {currentYear}
                    </h5>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <ChevronRight size={18} className="text-text-muted" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {daily.map((day) => {
                            const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1 && day.day === today.getDate()
                            const isSelected = selectedDay === day.day
                            const hasTx = day.has_transactions
                            const netPositive = day.net >= 0

                            return (
                                <button key={day.day} onClick={() => setSelectedDay(day.day)}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition relative ${
                                        isSelected
                                            ? 'bg-primary text-white shadow-sm'
                                            : isToday
                                                ? 'bg-primary-light/30 text-text-heading dark:text-text-heading-dark font-semibold'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-text-heading dark:text-text-heading-dark'
                                    }`}
                                >
                                    <span className={isToday && !isSelected ? 'text-primary' : ''}>{day.day}</span>
                                    {hasTx && (
                                        <div className="flex gap-0.5 mt-0.5">
                                            {day.income > 0 && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-income'}`} />
                                            )}
                                            {day.expense > 0 && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-expense'}`} />
                                            )}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedDay && selectedDayData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="card-sneat p-5 mt-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-text-heading dark:text-text-heading-dark">
                                {selectedDayData.date ? new Date(selectedDayData.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : `Hari ${selectedDay}`}
                            </h5>
                            <button onClick={() => setSelectedDay(null)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={16} className="text-text-muted" />
                            </button>
                        </div>

                        {selectedDayData.income > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-income font-medium">Pemasukan: {formatCurrency(selectedDayData.income)}</span>
                            </div>
                        )}
                        {selectedDayData.expense > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-expense font-medium">Pengeluaran: {formatCurrency(selectedDayData.expense)}</span>
                            </div>
                        )}

                        {selectedDayData.transactions?.length > 0 ? (
                            <div className="space-y-2">
                                {selectedDayData.transactions.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CategoryBadge category={t.category} />
                                            <div>
                                                <p className="text-xs text-text-muted">{t.description || '-'}</p>
                                                {t.labels?.length > 0 && (
                                                    <div className="flex gap-1 mt-0.5">
                                                        {t.labels.map((l) => (
                                                            <span key={l.id} className="text-[0.625rem] px-1.5 py-0.5 rounded-full text-white"
                                                                style={{ background: l.color }}>
                                                                {l.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted text-center py-4">Tidak ada transaksi</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    )
}
