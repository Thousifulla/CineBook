/**
 * Format a number as Indian currency (₹)
 */
export const formatCurrency = (amount) => {
    if (amount == null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Format a date string / Date object as a readable date
 * e.g. "21 Mar 2026"
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Format a date string / Date object to show day + time
 * e.g. "Saturday, 21 Mar · 06:30 PM"
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Format a date string / Date object to just time
 * e.g. "06:30 PM"
 */
export const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Returns a human-readable relative time string
 * e.g. "2 hours ago", "3 days ago"
 */
export const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};
