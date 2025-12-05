/**
 * Menu/CMS API service.
 * TODO: Replace mock implementations with real API calls when backend is ready.
 */

import { MenuItem, UserRole } from '../../types/domain';
import { MOCK_API_DELAYS } from '../../config/constants';
import { mockDelay } from './mockDelay';

// Menu items configuration by role
const MENU_ITEMS_BY_ROLE: Record<UserRole, MenuItem[]> = {
    user: [
        { id: 'overview', label: 'Overview', icon: 'home', order: 1 },
        { id: 'schedule', label: 'Schedule', icon: 'calendar', order: 2 },
        { id: 'requests', label: 'Requests', icon: 'swap', badge: 2, order: 3 },
    ],
    teamleader: [
        { id: 'overview', label: 'Overview', icon: 'home', order: 1 },
        { id: 'schedule', label: 'Schedule', icon: 'calendar', order: 2 },
        { id: 'team', label: 'Team', icon: 'users', order: 3 },
        { id: 'requests', label: 'Requests', icon: 'swap', badge: 5, order: 4 },
        { id: 'analytics', label: 'Analytics', icon: 'chart', order: 5 },
    ],
    admin: [
        { id: 'overview', label: 'Overview', icon: 'home', order: 1 },
        { id: 'schedule', label: 'Schedule', icon: 'calendar', order: 2 },
        { id: 'team', label: 'Team', icon: 'users', order: 3 },
        { id: 'requests', label: 'Requests', icon: 'swap', badge: 8, order: 4 },
        { id: 'analytics', label: 'Analytics', icon: 'chart', order: 5 },
        { id: 'settings', label: 'Settings', icon: 'cog', order: 6 },
    ],
};

/**
 * Fetch menu items for the current user based on their role.
 * @param sessionId - The session ID for authentication
 * @param role - The user's role
 * @returns Promise resolving to array of MenuItem
 */
export async function fetchMenuItems(_sessionId: string, role: UserRole = 'user'): Promise<MenuItem[]> {
    // TODO: Replace with real CMS API call
    // const response = await fetch('/api/cms/menu', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${sessionId}`
    //     },
    //     body: JSON.stringify({ sessionId })
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.CMS_MENU);

    // Return role-specific menu items
    return MENU_ITEMS_BY_ROLE[role] || MENU_ITEMS_BY_ROLE.user;
}

export const menuService = {
    fetchMenuItems,
};

export default menuService;
