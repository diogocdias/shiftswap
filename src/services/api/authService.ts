/**
 * Authentication API service.
 * TODO: Replace mock implementations with real API calls when backend is ready.
 */

import { UserSession, UserRole } from '../../types/domain';
import { MOCK_API_DELAYS } from '../../config/constants';
import { setUser, clearUser } from '../sessionService';
import { mockDelay } from './mockDelay';

// Mock users for development
const MOCK_USERS: Record<string, { password: string; name: string; role: UserRole }> = {
    'user@hospital.com': { password: 'password', name: 'Sarah Johnson', role: 'user' },
    'leader@hospital.com': { password: 'password', name: 'Dr. Michael Chen', role: 'teamleader' },
    'admin@hospital.com': { password: 'password', name: 'Administrator', role: 'admin' },
};

export interface LoginResult {
    success: boolean;
    error?: string;
    user?: UserSession;
}

/**
 * Authenticate a user with email and password.
 * @param email - User's email
 * @param password - User's password
 * @returns Promise resolving to login result
 */
export async function login(email: string, password: string): Promise<LoginResult> {
    // TODO: Replace with real API call
    // const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password })
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.LOGIN);

    const mockUser = MOCK_USERS[email];
    if (!mockUser || mockUser.password !== password) {
        return { success: false, error: 'Invalid email or password' };
    }

    const userSession: UserSession = {
        name: mockUser.name,
        email: email,
        role: mockUser.role,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Store in session
    setUser(userSession);

    return { success: true, user: userSession };
}

/**
 * Log out the current user.
 * @returns Promise resolving when logout is complete
 */
export async function logout(): Promise<void> {
    // TODO: Replace with real API call to invalidate session on server
    // await fetch('/api/auth/logout', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     }
    // });

    clearUser();
}

/**
 * Validate the current session.
 * @returns Promise resolving to whether the session is valid
 */
export async function validateSession(): Promise<boolean> {
    // TODO: Replace with real API call
    // const response = await fetch('/api/auth/session', {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     }
    // });
    // return response.ok;

    // For mock, just check if session exists
    return true;
}

export const authService = {
    login,
    logout,
    validateSession,
};

export default authService;
