import { useCallback, useEffect, useState } from 'react'
import { LS_EVENT, readLS, writeLS } from '../lib/storage.js'

/**
 * useLocalStorage — keeps React state and LocalStorage in sync.
 *
 * Why LocalStorage? It survives refresh and is perfect for portfolio demos without a backend.
 * Flow: user updates UI → `setValue` → JSON saved → custom event → other hooks/components re-read.
 *
 * Returns `[value, setValue]` like `useState`, where `setValue` accepts a value or updater fn.
 */
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => readLS(key, initialValue))

  const setValue = useCallback(
    (next) => {
      setState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        writeLS(key, resolved)
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    const sync = (event) => {
      if (event.type === 'storage') {
        setState(readLS(key, initialValue))
        return
      }
      if (event.detail?.key === key) {
        setState(readLS(key, initialValue))
      }
    }
    window.addEventListener(LS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(LS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [key, initialValue])

  return [state, setValue]
}
