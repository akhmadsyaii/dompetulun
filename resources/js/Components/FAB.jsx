import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FAB({ onClick }) {
    const [visible, setVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            setVisible(currentScrollY < lastScrollY.current || currentScrollY < 20)
            lastScrollY.current = currentScrollY
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClick}
                    className="fixed bottom-20 right-5 z-40 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl"
                >
                    <Plus size={24} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
