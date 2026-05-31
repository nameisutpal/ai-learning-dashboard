/**
 * Central list of LocalStorage keys so pages and hooks never typo the same string.
 * Change values here if you ever need to migrate old data.
 */
export const LS_KEYS = {
  studySessions: 'ai-learn:study-sessions',
  tasks: 'ai-learn:tasks',
  notes: 'ai-learn:notes',
  /** Single JSON blob for theme, goals, density, and notification toggles (see PreferencesContext). */
  userPreferences: 'ai-learn:user-preferences',
  /**
   * Normalized LMS graph: courses + related resources/notes/tasks/sessions.
   * Mirrors a future `GET /api/v1/lms/state` payload — swap persistence in `services/lmsState.js`.
   */
  lmsState: 'ai-learn:lms-state-v1',
}

/** Bump when the export JSON shape changes — import validates this number. */
export const DASHBOARD_EXPORT_VERSION = 1
