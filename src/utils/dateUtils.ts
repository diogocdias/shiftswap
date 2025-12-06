/**
 * Date utility functions for consistent date handling across the application.
 */

/**
 * Convert a Date to ISO date string (YYYY-MM-DD).
 * @param date - The date to convert
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Format a date for display (e.g., "Dec 5").
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatShortDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get the day name abbreviation (e.g., "Mon", "Tue").
 * @param date - The date to get day name for
 * @returns Day name abbreviation
 */
export function getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format a date for full display (e.g., "Thursday, December 5, 2024").
 * @param date - The date to format
 * @returns Full formatted date string
 */
export function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Get month and year string (e.g., "December 2024").
 * @param date - The date to format
 * @returns Month and year string
 */
export function getMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Check if a date is today.
 * @param date - The date to check (can be null)
 * @returns true if the date is today
 */
export function isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Get the start of the week (Monday) for a given date.
 * @param date - The reference date
 * @returns Date object representing Monday of that week
 */
export function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

/**
 * Get the week range string (e.g., "Dec 2 - Dec 8").
 * @param weekStart - The start of the week (Monday)
 * @returns Week range string
 */
export function getWeekRange(weekStart: Date): string {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    return `${formatShortDate(weekStart)} - ${formatShortDate(endDate)}`;
}

/**
 * Get all dates in a week starting from a given date.
 * @param weekStart - The start date of the week
 * @returns Array of 7 dates
 */
export function getWeekDays(weekStart: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
}

/**
 * Get all days in a month including empty placeholders for calendar display.
 * @param year - The year
 * @param month - The month (0-indexed)
 * @returns Array of dates (null for placeholder cells before month start)
 */
export function getMonthDays(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStart; i++) {
        days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    return days;
}

/**
 * Get the number of days in a month.
 * @param year - The year
 * @param month - The month (0-indexed)
 * @returns Number of days
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}
