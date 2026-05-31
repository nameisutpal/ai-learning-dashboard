import { LS_KEYS } from '../constants/storageKeys.js'
import { normalizeUserPreferences } from '../constants/userPreferences.js'
import { readLS, writeLS } from './storage.js'

/** Read + normalize preferences from LocalStorage (safe for any caller, including non-React code). */
export function readUserPreferences() {
  return normalizeUserPreferences(readLS(LS_KEYS.userPreferences, null))
}

/** Persist full preferences object and broadcast `LS_EVENT` (same-tab + other hooks). */
export function writeUserPreferences(next) {
  writeLS(LS_KEYS.userPreferences, normalizeUserPreferences(next))
}
