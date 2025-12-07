/**
 * Time-off data service for managing and accessing staff vacation records.
 * This service provides a shared data store accessible across components.
 */

import { VacationRecord, VacationType } from '../types/domain';

// Mock initial vacation records with some dates that will show in current schedules
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const MOCK_TIME_OFF_RECORDS: VacationRecord[] = [
    {
        id: '1',
        userId: '1',
        userName: 'Sarah Johnson',
        type: 'vacation',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-27`,
        notes: 'Holiday vacation',
        status: 'approved',
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'Admin',
    },
    {
        id: '2',
        userId: '3',
        userName: 'Emily Davis',
        type: 'sick',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-11`,
        notes: 'Doctor appointment',
        status: 'approved',
        createdAt: '2024-12-08T14:30:00Z',
        createdBy: 'Admin',
    },
    {
        id: '3',
        userId: '5',
        userName: 'Lisa Anderson',
        type: 'personal',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
        notes: 'Personal matters',
        status: 'approved',
        createdAt: '2024-12-05T09:15:00Z',
        createdBy: 'Team Leader',
    },
    {
        id: '4',
        userId: '2',
        userName: 'Mike Chen',
        type: 'special',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-06`,
        notes: 'Training course',
        status: 'approved',
        createdAt: '2024-12-01T08:00:00Z',
        createdBy: 'Admin',
    },
    {
        id: '5',
        userId: '7',
        userName: 'Maria Garcia',
        type: 'vacation',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-14`,
        notes: 'Family event',
        status: 'approved',
        createdAt: '2024-12-02T11:00:00Z',
        createdBy: 'Admin',
    },
];

// In-memory store for time-off records
let timeOffRecords: VacationRecord[] = [...MOCK_TIME_OFF_RECORDS];

// Listeners for changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

/**
 * Get all time-off records.
 */
export function getTimeOffRecords(): VacationRecord[] {
    return [...timeOffRecords];
}

/**
 * Set all time-off records (used by VacationTab).
 */
export function setTimeOffRecords(records: VacationRecord[]): void {
    timeOffRecords = [...records];
    notifyListeners();
}

/**
 * Add a new time-off record.
 */
export function addTimeOffRecord(record: VacationRecord): void {
    timeOffRecords = [...timeOffRecords, record];
    notifyListeners();
}

/**
 * Update an existing time-off record.
 */
export function updateTimeOffRecord(id: string, updates: Partial<VacationRecord>): void {
    timeOffRecords = timeOffRecords.map(r =>
        r.id === id ? { ...r, ...updates } : r
    );
    notifyListeners();
}

/**
 * Delete a time-off record.
 */
export function deleteTimeOffRecord(id: string): void {
    timeOffRecords = timeOffRecords.filter(r => r.id !== id);
    notifyListeners();
}

/**
 * Check if a user has time off on a specific date.
 * @returns The time-off record if exists, undefined otherwise
 */
export function getTimeOffForDate(userId: string, dateString: string): VacationRecord | undefined {
    return timeOffRecords.find(record => {
        if (record.userId !== userId) return false;
        const start = new Date(record.startDate);
        const end = new Date(record.endDate);
        const date = new Date(dateString);
        return date >= start && date <= end;
    });
}

/**
 * Check if a user has time off on a specific date.
 * @returns true if the user is on time off that day
 */
export function isOnTimeOff(userId: string, dateString: string): boolean {
    return getTimeOffForDate(userId, dateString) !== undefined;
}

/**
 * Get time-off type info for display.
 */
export const TIME_OFF_TYPES: Record<VacationType, { label: string; shortLabel: string; color: string; icon: string }> = {
    vacation: { label: 'Vacation', shortLabel: 'VAC', color: 'bg-blue-200 text-blue-900', icon: '🏖️' },
    sick: { label: 'Sick Leave', shortLabel: 'SICK', color: 'bg-red-200 text-red-900', icon: '🏥' },
    personal: { label: 'Personal', shortLabel: 'PER', color: 'bg-purple-200 text-purple-900', icon: '👤' },
    special: { label: 'Special', shortLabel: 'SPE', color: 'bg-amber-200 text-amber-900', icon: '⭐' },
    other: { label: 'Other', shortLabel: 'OFF', color: 'bg-gray-200 text-gray-900', icon: '📋' },
};

/**
 * Subscribe to time-off record changes.
 * @returns Unsubscribe function
 */
export function subscribeToTimeOff(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyListeners(): void {
    listeners.forEach(listener => listener());
}
