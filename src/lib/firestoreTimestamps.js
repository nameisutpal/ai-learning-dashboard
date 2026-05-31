/** Normalize Firestore Timestamp | string | missing → ISO string for sorting / display. */
export function toIso(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  if (typeof value.toMillis === 'function') return new Date(value.toMillis()).toISOString()
  return ''
}
