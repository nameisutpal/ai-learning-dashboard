import { useContext } from 'react'
import { LmsContext } from '../contexts/lmsContext.js'

export function useLms() {
  const ctx = useContext(LmsContext)
  if (!ctx) throw new Error('useLms must be used within LmsProvider')
  return ctx
}
