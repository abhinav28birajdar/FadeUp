import { format, isToday as dateFnsIsToday, addMinutes as dateFnsAddMinutes, parseISO } from 'date-fns';

export function formatDate(iso: string): string {
    try {
        return format(parseISO(iso), 'EEE, dd MMM yyyy');
    } catch (e) {
        return iso;
    }
}

export function formatTime(iso: string): string {
    try {
        return format(parseISO(iso), 'h:mm a');
    } catch (e) {
        return iso;
    }
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
}

export function isToday(iso: string): boolean {
    try {
        return dateFnsIsToday(parseISO(iso));
    } catch (e) {
        return false;
    }
}

export function addMinutes(iso: string, minutes: number): string {
    try {
        return dateFnsAddMinutes(parseISO(iso), minutes).toISOString();
    } catch (e) {
        return iso;
    }
}

export function generateTimeSlots(openTime: string, closeTime: string, durationMinutes: number): string[] {
    // basic implementation, assuming time formats like "09:00"
    const slots: string[] = [];
    try {
        let [openH, openM] = openTime.split(':').map(Number);
        const [closeH, closeM] = closeTime.split(':').map(Number);

        let currentInMinutes = openH * 60 + openM;
        const closeInMinutes = closeH * 60 + closeM;

        while (currentInMinutes + durationMinutes <= closeInMinutes) {
            const h = Math.floor(currentInMinutes / 60);
            const m = currentInMinutes % 60;
            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            currentInMinutes += durationMinutes;
        }
    } catch (e) {
        // Handling error gracefully
    }
    return slots;
}
