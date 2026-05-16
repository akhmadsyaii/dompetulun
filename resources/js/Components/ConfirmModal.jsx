import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmText = 'Delete', variant = 'danger' }) {
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="card-sneat p-6 w-full max-w-sm shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${variant === 'danger' ? 'bg-expense/10' : 'bg-warning/10'}`}>
                                <AlertTriangle size={24} className={variant === 'danger' ? 'text-expense' : 'text-warning'} />
                            </div>
                            <h5 className="text-base font-semibold text-text-heading dark:text-text-heading-dark">{title}</h5>
                            <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">{message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose}
                                className="btn-outline-sneat flex-1 py-2.5 text-sm">Cancel</button>
                            <button onClick={onConfirm} autoFocus
                                className={`flex-1 py-2.5 text-sm font-medium rounded-md text-white transition ${variant === 'danger' ? 'bg-expense hover:bg-red-600' : 'bg-warning hover:bg-amber-600'}`}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
