/**
 * Unified type definitions for the ShiftSwap application.
 * All domain types should be defined here for consistency across the codebase.
 */

// Shift type union - used consistently across the app
export type ShiftType = 'M' | 'A' | 'N' | 'R' | 'D';

// Working shift types (excludes rest and day off)
export type WorkingShiftType = 'M' | 'A' | 'N';

// Request status
export type RequestStatus = 'pending' | 'approved' | 'declined';

// User roles
export type UserRole = 'user' | 'teamleader' | 'admin';

// Shift data structure for schedules
export interface ShiftData {
    [personId: string]: {
        [date: string]: ShiftType[];
    };
}

// Team member
export interface TeamMember {
    id: string;
    name: string;
    role: string;
}

// Shift detail with date
export interface ShiftDetail {
    date: string;
    shiftType: ShiftType;
    time?: string; // Optional time display string
}

// Unified Swap Request interface
export interface SwapRequest {
    id: string;
    // Requester info
    fromUserId: string;
    fromUserName?: string; // Display name (optional for backward compatibility)
    // Target user info
    toUserId: string;
    toUserName?: string; // Display name (optional for backward compatibility)
    // Shift info
    fromShift: ShiftDetail;
    toShift: ShiftDetail;
    // Additional shifts for multi-shift swaps
    fromShifts?: ShiftDetail[];
    toShifts?: ShiftDetail[];
    // Status and metadata
    status: RequestStatus;
    createdAt: string;
}

// Form data for creating swap requests
export interface SwapFormData {
    targetUserId: string;
    targetDate: string;
    targetShift: ShiftType;
    myDate: string;
    myShift: ShiftType;
    myShifts: ShiftDetail[];
    targetShifts: ShiftDetail[];
}

// User profile
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    department: string;
    employeeId: string;
    facility: string;
    startDate: string;
    profilePicture: string | null;
}

// Session user data (stored in sessionStorage)
export interface UserSession {
    name: string;
    email: string;
    role: UserRole;
    sessionId: string;
    profilePicture?: string | null;
    phone?: string;
    department?: string;
    employeeId?: string;
    facility?: string;
    startDate?: string;
}

// Menu item for navigation
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    badge?: number;
    order: number;
}

// Vacation/Time-off types
export type VacationType = 'vacation' | 'sick' | 'personal' | 'special' | 'other';

export interface VacationRecord {
    id: string;
    userId: string;
    userName: string;
    type: VacationType;
    startDate: string;
    endDate: string;
    notes?: string;
    status: 'approved' | 'pending' | 'declined';
    createdAt: string;
    createdBy: string;
}
