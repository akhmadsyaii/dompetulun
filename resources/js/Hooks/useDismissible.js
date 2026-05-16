import { useState } from 'react'

export default function useDismissible(key, defaultValue = true) {
    const storageKey = `dismissed_${key}`
    const [visible, setVisible] = useState(() => {
        try {
            return localStorage.getItem(storageKey) !== 'hidden'
        } catch {
            return defaultValue
        }
    })

    const dismiss = () => {
        try {
            localStorage.setItem(storageKey, 'hidden')
        } catch {}
        setVisible(false)
    }

    return [visible, dismiss]
}
