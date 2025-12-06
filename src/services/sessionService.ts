/**
 * Session service for managing user session data.
 * Provides a centralized abstraction over sessionStorage.
 */

import { UserSession, UserRole } from '../types/domain';
import { STORAGE_KEYS, DEFAULTS } from '../config/constants';

/**
 * Get the current user session from sessionStorage.
 * @returns The user session or null if not logged in
 */
export function getUser(): UserSession | null {
    try {
        const userDataString = sessionStorage.getItem(STORAGE_KEYS.USER_SESSION);
        if (!userDataString) return null;
        return JSON.parse(userDataString) as UserSession;
    } catch {
        console.error('Failed to parse user session data');
        return null;
    }
}

/**
 * Set the user session in sessionStorage.
 * @param userData - The user session data to store
 */
export function setUser(userData: UserSession): void {
    try {
        sessionStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userData));
    } catch (error) {
        console.error('Failed to save user session:', error);
    }
}

/**
 * Update specific fields in the user session.
 * @param updates - Partial user session data to merge
 */
export function updateUser(updates: Partial<UserSession>): void {
    const currentUser = getUser();
    if (currentUser) {
        setUser({ ...currentUser, ...updates });
    }
}

/**
 * Clear the user session (logout).
 */
export function clearUser(): void {
    sessionStorage.removeItem(STORAGE_KEYS.USER_SESSION);
}

/**
 * Get the current user's role.
 * @returns The user role or default 'user' if not logged in
 */
export function getUserRole(): UserRole {
    const user = getUser();
    return (user?.role as UserRole) || DEFAULTS.USER_ROLE as UserRole;
}

/**
 * Check if a user is currently logged in.
 * @returns true if a valid session exists
 */
export function isLoggedIn(): boolean {
    return getUser() !== null;
}

/**
 * Get the current user's ID.
 * @returns The user ID or default value
 */
export function getUserId(): string {
    const user = getUser();
    // TODO: Replace with actual user ID field when backend provides it
    return user?.employeeId || DEFAULTS.LOGGED_IN_USER_ID;
}

// Export as a service object for those who prefer that pattern
export const sessionService = {
    getUser,
    setUser,
    updateUser,
    clearUser,
    getUserRole,
    isLoggedIn,
    getUserId,
};

export default sessionService;
