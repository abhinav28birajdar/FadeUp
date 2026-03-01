export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

export function formatWaitTime(minutes: number): string {
    if (minutes < 60) {
        return `~${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `~${h}h ${m}m`;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
