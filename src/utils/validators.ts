export function isValidEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export function isValidPhone(phone: string): boolean {
    const re = /^\+?[1-9]\d{1,14}$/; // Basic E.164 format check
    return re.test(phone) || phone.length >= 10;
}

export function isValidPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters.' };
    }
    return { valid: true, message: '' };
}
