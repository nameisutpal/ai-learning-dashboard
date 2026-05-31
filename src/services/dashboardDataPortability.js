import { DASHBOARD_EXPORT_VERSION, LS_KEYS } from '../constants/storageKeys.js'
import { normalizeUserPreferences } from '../constants/userPreferences.js'
import { readLS, writeLS } from '../lib/storage.js'
import { readUserPreferences } from '../lib/preferences.js'

/**
 * Bundles every dashboard-related LocalStorage slice into one JSON file.
 * Pure functions only — easy to unit test or swap for API uploads later.
 */
export function buildDashboardExportPayload() {
  return {
    version: DASHBOARD_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      studySessions: readLS(LS_KEYS.studySessions, []),
      tasks: readLS(LS_KEYS.tasks, []),
      notes: readLS(LS_KEYS.notes, []),
      userPreferences: readUserPreferences(),
    },
  }
}

export function serializeDashboardExport() {
  return JSON.stringify(buildDashboardExportPayload(), null, 2)
}

/**
 * Validates an imported JSON object before it touches LocalStorage.
 * Returns `{ ok: true, payload }` or `{ ok: false, errors: string[] }`.
 */
export function validateDashboardImport(raw) {
  const errors = []
  if (!raw || typeof raw !== 'object') {
    errors.push('File must contain a JSON object.')
    return { ok: false, errors }
  }
  if (Number(raw.version) !== DASHBOARD_EXPORT_VERSION) {
    errors.push(`Unsupported export version (expected ${DASHBOARD_EXPORT_VERSION}).`)
  }
  if (!raw.data || typeof raw.data !== 'object') {
    errors.push('Missing "data" object.')
    return { ok: false, errors }
  }
  const { data } = raw
  ;['studySessions', 'tasks', 'notes'].forEach((key) => {
    if (!Array.isArray(data[key])) {
      errors.push(`"data.${key}" must be an array.`)
    }
  })
  if (data.userPreferences !== undefined && (typeof data.userPreferences !== 'object' || data.userPreferences === null)) {
    errors.push('"data.userPreferences" must be an object when present.')
  }
  if (errors.length) return { ok: false, errors }
  return { ok: true, payload: raw }
}

/** Shallow row checks — keeps corrupt rows from wiping good state silently. */
function sanitizeSessions(rows) {
  return rows.filter((r) => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.subject === 'string')
}

function sanitizeTasks(rows) {
  return rows.filter(
    (r) => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.title === 'string' && typeof r.done === 'boolean',
  )
}

function sanitizeNotes(rows) {
  return rows.filter(
    (r) =>
      r &&
      typeof r === 'object' &&
      typeof r.id === 'string' &&
      typeof r.title === 'string' &&
      typeof r.content === 'string',
  )
}

/**
 * Writes validated import into LocalStorage and relies on existing `writeLS`
 * helpers from feature hooks where possible — here we set keys directly then
 * dispatch a synthetic refresh by writing preferences last (already uses writeLS).
 */
export function applyDashboardImport(validatedPayload) {
  const { data } = validatedPayload
  const sessions = sanitizeSessions(data.studySessions)
  const tasks = sanitizeTasks(data.tasks)
  const notes = sanitizeNotes(data.notes)
  const prefs = data.userPreferences ? normalizeUserPreferences(data.userPreferences) : readUserPreferences()

  writeLS(LS_KEYS.studySessions, sessions)
  writeLS(LS_KEYS.tasks, tasks)
  writeLS(LS_KEYS.notes, notes)
  writeLS(LS_KEYS.userPreferences, prefs)
}
