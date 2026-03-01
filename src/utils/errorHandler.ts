export function getFirebaseErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'permission-denied': 'You do not have permission for this action.',
        'not-found': 'The requested item was not found.',
        'unavailable': 'Service unavailable. Try again shortly.',
    };
    return messages[code] ?? 'Something went wrong. Please try again.';
}
