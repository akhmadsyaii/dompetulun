import { useState, useCallback } from 'react'

export default function useLocalStorage(key, defaultValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue
        } catch {
            return defaultValue
        }
    })

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch { }
    }, [key, storedValue])

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key)
            setStoredValue(defaultValue)
        } catch { }
    }, [key, defaultValue])

    return [storedValue, setValue, removeValue]
}

export function getLocalStorage(key, defaultValue) {
    try {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
    } catch {
        return defaultValue
    }
}

export function setLocalStorage(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value))
    } catch { }
}

export function removeLocalStorage(key) {
    try {
        window.localStorage.removeItem(key)
    } catch { }
}
