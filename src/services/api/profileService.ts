/**
 * Profile API service.
 * TODO: Replace mock implementations with real API calls when backend is ready.
 */

import { UserProfile } from '../../types/domain';
import { MOCK_API_DELAYS } from '../../config/constants';
import { getUser } from '../sessionService';
import { mockDelay } from './mockDelay';

/**
 * Fetch user profile from the API.
 * @param userId - The user ID to fetch profile for
 * @returns Promise resolving to UserProfile
 */
export async function fetchUserProfile(_userId: string): Promise<UserProfile> {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/users/${userId}/profile`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     }
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.PROFILE_FETCH);

    // Get user data from session (simulating session-based user identification)
    const userData = getUser();

    // Mock API response - in real implementation, this would come from backend
    return {
        name: userData?.name || 'User',
        email: userData?.email || '',
        phone: userData?.phone || '+1 (555) 123-4567',
        role: userData?.role || 'user',
        department: userData?.department || 'Emergency Department',
        employeeId: userData?.employeeId || 'EMP-001234',
        facility: userData?.facility || 'Memorial Hospital',
        startDate: userData?.startDate || '2023-06-15',
        profilePicture: userData?.profilePicture || null,
    };
}

/**
 * Save user profile to the API.
 * @param profile - The profile data to save
 * @returns Promise resolving to success status
 */
export async function saveUserProfile(_profile: UserProfile): Promise<{ success: boolean }> {
    // TODO: Replace with real API call
    // const response = await fetch('/api/users/profile', {
    //     method: 'PUT',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     },
    //     body: JSON.stringify(profile)
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.PROFILE_SAVE);

    // Mock successful response
    return { success: true };
}

export const profileService = {
    fetchUserProfile,
    saveUserProfile,
};

export default profileService;
