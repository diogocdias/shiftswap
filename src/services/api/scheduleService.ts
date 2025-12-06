/**
 * Schedule API service.
 * TODO: Replace mock implementations with real API calls when backend is ready.
 */

import { ShiftData, TeamMember, SwapRequest, SwapFormData } from '../../types/domain';
import { MOCK_API_DELAYS, DEFAULTS } from '../../config/constants';
import { generateRealisticSchedule } from '../../utils/shiftGenerator';
import { mockDelay } from './mockDelay';

/**
 * Generate team schedule for a date range.
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @param teamMembers - Array of team members
 * @returns Promise resolving to generated ShiftData
 */
export async function generateSchedule(
    startDate: string,
    endDate: string,
    teamMembers: TeamMember[]
): Promise<ShiftData> {
    // TODO: Replace with real API call
    // const response = await fetch('/api/schedule/generate', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     },
    //     body: JSON.stringify({ startDate, endDate, teamMemberIds: teamMembers.map(m => m.id) })
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.SCHEDULE_GENERATE);
    return generateRealisticSchedule(startDate, endDate, teamMembers);
}

/**
 * Submit a swap request.
 * @param formData - The swap form data
 * @param loggedInUserId - The ID of the user making the request
 * @returns Promise resolving to the created swap requests
 */
export async function submitSwapRequest(
    formData: SwapFormData,
    loggedInUserId: string = DEFAULTS.LOGGED_IN_USER_ID
): Promise<SwapRequest[]> {
    // TODO: Replace with real API call
    // const response = await fetch('/api/swaps', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getUser()?.sessionId}`
    //     },
    //     body: JSON.stringify(formData)
    // });
    // return response.json();

    await mockDelay(MOCK_API_DELAYS.SWAP_REQUEST);

    // Create swap requests for all combinations of my shifts and target shifts
    const newRequests: SwapRequest[] = [];
    let requestIndex = 0;

    for (const myShift of formData.myShifts) {
        for (const targetShift of formData.targetShifts) {
            newRequests.push({
                id: `swap_${Date.now()}_${requestIndex++}`,
                fromUserId: loggedInUserId,
                toUserId: formData.targetUserId,
                fromShift: {
                    date: myShift.date,
                    shiftType: myShift.shiftType,
                },
                toShift: {
                    date: targetShift.date,
                    shiftType: targetShift.shiftType,
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
        }
    }

    return newRequests;
}

export const scheduleService = {
    generateSchedule,
    submitSwapRequest,
};

export default scheduleService;
