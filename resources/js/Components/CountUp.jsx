import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export default function CountUp({ from = 0, to, duration = 1.2, decimals = 0, className = '', ...props }) {
    const count = useMotionValue(from)
    const rounded = useTransform(count, (v) => v.toFixed(decimals))
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (hasAnimated.current) return
        hasAnimated.current = true
        const controls = animate(count, to, { duration, ease: [0.25, 0.1, 0.25, 1] })
        return controls.stop
    }, [to, duration, count])

    return <motion.span className={className} {...props}>{rounded}</motion.span>
}
