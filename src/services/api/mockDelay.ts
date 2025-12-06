/**
 * Utility for simulating API delays in mock implementations.
 * All mock API functions should use this for consistent delay simulation.
 */

/**
 * Simulate network delay for mock API calls.
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function mockDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default mockDelay;
