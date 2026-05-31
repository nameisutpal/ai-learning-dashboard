/**
 * @typedef {'beginner' | 'intermediate' | 'advanced'} Difficulty
 */

/**
 * @typedef {'youtube' | 'article' | 'pdf' | 'external_course'} ResourceKind
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} thumbnailUrl
 * @property {string} category
 * @property {Difficulty} difficulty
 * @property {string[]} tags
 * @property {number} estimatedDurationHours
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CourseResource
 * @property {string} id
 * @property {string} courseId
 * @property {ResourceKind} kind
 * @property {string} title
 * @property {string} url
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CourseNote
 * @property {string} id
 * @property {string} courseId
 * @property {string} title
 * @property {string} body
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CourseTask
 * @property {string} id
 * @property {string} courseId
 * @property {string} title
 * @property {boolean} done
 * @property {string} createdAt
 */

/**
 * @typedef {Object} StudySession
 * @property {string} id
 * @property {string} courseId
 * @property {string} startedAt
 * @property {string} endedAt
 */

/**
 * Aggregate persisted document — backend would likely split into normalized tables + relations.
 * @typedef {Object} LmsState
 * @property {1} version
 * @property {Course[]} courses
 * @property {CourseResource[]} resources
 * @property {CourseNote[]} notes
 * @property {CourseTask[]} tasks
 * @property {StudySession[]} sessions
 */

export {}
