/**
 * Swap Requests API service.
 * TODO: Replace mock implementations with real API calls when backend is ready.
 */

import { RequestStatus } from '../../types/domain';
import { MOCK_API_DELAYS } from '../../config/constants';
import { mockDelay } from './mockDelay';

/**
 * Approve a swap request.
 * @param requestId - The ID of the request to approve
 * @returns Promise resolving to the updated request
 */
export async function approveRequest(_requestId: string): Promise<{ success: boolean; status: RequestStatus }> {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/swaps/${requestId}/approve`, {
    //     method: 'PATCH',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     }
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.APPROVE_DECLINE);
    return { success: true, status: 'approved' };
}

/**
 * Decline a swap request.
 * @param requestId - The ID of the request to decline
 * @returns Promise resolving to the updated request
 */
export async function declineRequest(_requestId: string): Promise<{ success: boolean; status: RequestStatus }> {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/swaps/${requestId}/decline`, {
    //     method: 'PATCH',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     }
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.APPROVE_DECLINE);
    return { success: true, status: 'declined' };
}

/**
 * Cancel a swap request.
 * @param requestId - The ID of the request to cancel
 * @returns Promise resolving to success status
 */
export async function cancelRequest(_requestId: string): Promise<{ success: boolean }> {
    // TODO: Replace with real API call

    await mockDelay(MOCK_API_DELAYS.APPROVE_DECLINE);
    return { success: true };
}

/**
 * Accept an incoming swap request (for the target user).
 * @param requestId - The ID of the request to accept
 * @returns Promise resolving to the updated request
 */
export async function acceptRequest(_requestId: string): Promise<{ success: boolean; status: RequestStatus }> {
    // TODO: Replace with real API call

    await mockDelay(MOCK_API_DELAYS.APPROVE_DECLINE);
    return { success: true, status: 'approved' };
}

export const requestsService = {
    approveRequest,
    declineRequest,
    cancelRequest,
    acceptRequest,
};

export default requestsService;
