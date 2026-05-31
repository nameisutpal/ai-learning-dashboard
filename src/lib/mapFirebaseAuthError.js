/**
 * Turn Firebase `auth/` error codes into short, user-friendly messages.
 * Keeps forms clean — map unknown codes to a generic fallback.
 */
export function mapFirebaseAuthError(code) {
  const map = {
    'auth/invalid-email': 'That email address does not look valid.',
    'auth/user-disabled': 'This account has been disabled. Contact support if you think this is a mistake.',
    'auth/user-not-found': 'No account exists with that email yet. Try signing up.',
    'auth/wrong-password': 'Incorrect password. Try again or reset your password from Firebase Console.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already uses this email. Try logging in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled before it finished.',
    'auth/popup-blocked': 'The browser blocked the sign-in popup. Allow popups for this site.',
    'auth/account-exists-with-different-credential': 'This email is linked to another sign-in method.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
