import { LS_KEYS } from '../constants/storageKeys.js'
import { readLS, writeLS } from '../lib/storage.js'

const DEFAULT_STATE = {
  version: 1,
  courses: [],
  resources: [],
  notes: [],
  tasks: [],
  sessions: [],
}

/**
 * @param {unknown} raw
 */
export function normalizeLmsState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STATE }
  }
  const v = /** @type {Record<string, unknown>} */ (raw)
  if (v.version !== 1) {
    return { ...DEFAULT_STATE }
  }
  return {
    version: 1,
    courses: Array.isArray(v.courses) ? /** @type {typeof DEFAULT_STATE.courses} */ (v.courses) : [],
    resources: Array.isArray(v.resources) ? /** @type {typeof DEFAULT_STATE.resources} */ (v.resources) : [],
    notes: Array.isArray(v.notes) ? /** @type {typeof DEFAULT_STATE.notes} */ (v.notes) : [],
    tasks: Array.isArray(v.tasks) ? /** @type {typeof DEFAULT_STATE.tasks} */ (v.tasks) : [],
    sessions: Array.isArray(v.sessions) ? /** @type {typeof DEFAULT_STATE.sessions} */ (v.sessions) : [],
  }
}

/** @returns {typeof DEFAULT_STATE} */
export function loadLmsState() {
  return normalizeLmsState(readLS(LS_KEYS.lmsState, null))
}

/** @param {typeof DEFAULT_STATE} state */
export function saveLmsState(state) {
  writeLS(LS_KEYS.lmsState, state)
}
