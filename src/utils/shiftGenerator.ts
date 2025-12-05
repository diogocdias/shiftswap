/**
 * Shift generation utilities for creating mock schedule data.
 * Consolidates the various shift generation functions into a single configurable utility.
 */

import { ShiftData, ShiftType, WorkingShiftType, TeamMember } from '../types/domain';
import { toISODateString } from './dateUtils';
import { SHIFT_GENERATION } from '../config/constants';

// All shift types
const ALL_SHIFT_TYPES: ShiftType[] = ['M', 'A', 'N', 'R', 'D'];

// Working shift types only
const WORKING_SHIFTS: WorkingShiftType[] = ['M', 'A', 'N'];

// Valid double shift combinations (consecutive shifts)
const VALID_DOUBLE_SHIFTS: [WorkingShiftType, WorkingShiftType][] = [
    ['M', 'A'], // Morning + Afternoon (12 hours)
    ['A', 'N'], // Afternoon + Night (12 hours)
];

/**
 * Generate a random shift type from an array of options.
 * Ensures no duplicates by checking against already assigned shifts.
 */
function getRandomShift<T extends ShiftType>(options: T[], exclude: ShiftType[] = []): T {
    const available = options.filter(s => !exclude.includes(s));
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Generate random shifts for a single day.
 * Basic generator that randomly assigns 1-2 shifts from all types.
 */
function generateDayShifts(): ShiftType[] {
    const numShifts = Math.random() > 0.7 ? 2 : 1;
    const dayShifts: ShiftType[] = [];

    for (let j = 0; j < numShifts; j++) {
        const shift = getRandomShift(ALL_SHIFT_TYPES, dayShifts);
        dayShifts.push(shift);
    }

    return dayShifts;
}

/**
 * Generate mock shifts for a week (7 days) for all team members.
 * @param startDate - The Monday of the week
 * @param teamMembers - Array of team members
 * @returns ShiftData object with shifts for all members
 */
export function generateWeekShifts(startDate: Date, teamMembers: TeamMember[]): ShiftData {
    const shifts: ShiftData = {};

    teamMembers.forEach(member => {
        shifts[member.id] = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = toISODateString(date);
            shifts[member.id][dateKey] = generateDayShifts();
        }
    });

    return shifts;
}

/**
 * Generate shifts for an entire month for a single user.
 * Used for personal calendar view.
 * @param year - The year
 * @param month - The month (0-indexed)
 * @param userId - The user ID
 * @returns ShiftData object with shifts for the user
 */
export function generateMonthShiftsForUser(year: number, month: number, userId: string): ShiftData {
    const shifts: ShiftData = { [userId]: {} };
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = toISODateString(date);
        shifts[userId][dateKey] = generateDayShifts();
    }

    return shifts;
}

/**
 * Generate shifts for an entire month for all team members.
 * Used for team month view on desktop.
 * @param year - The year
 * @param month - The month (0-indexed)
 * @param teamMembers - Array of team members
 * @returns ShiftData object with shifts for all members
 */
export function generateMonthShiftsForTeam(year: number, month: number, teamMembers: TeamMember[]): ShiftData {
    const shifts: ShiftData = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    teamMembers.forEach(member => {
        shifts[member.id] = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = toISODateString(date);
            shifts[member.id][dateKey] = generateDayShifts();
        }
    });

    return shifts;
}

/**
 * Generate realistic schedule for a date range.
 * Follows business rules:
 * - Working shifts can be single or double (consecutive like M+A or A+N)
 * - Rest and Day Off cannot be combined with working shifts
 * - Each person gets roughly 2 rest/off days per week
 *
 * @param startDate - Start date string (ISO format)
 * @param endDate - End date string (ISO format)
 * @param teamMembers - Array of team members
 * @returns ShiftData object with generated shifts
 */
export function generateRealisticSchedule(
    startDate: string,
    endDate: string,
    teamMembers: TeamMember[]
): ShiftData {
    const shifts: ShiftData = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    teamMembers.forEach(member => {
        shifts[member.id] = {};
        let workingDaysInWeek = 0;
        let currentWeekStart: Date | null = null;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const dateKey = toISODateString(currentDate);
            const dayOfWeek = currentDate.getDay();

            // Track weeks to ensure ~2 rest/off days per week
            if (currentWeekStart === null || dayOfWeek === 1) {
                currentWeekStart = new Date(currentDate);
                workingDaysInWeek = 0;
            }

            // Determine if this should be a rest/off day
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const needsRestDay = workingDaysInWeek >= SHIFT_GENERATION.MAX_WORKING_DAYS_BEFORE_REST;
            const restDayChance = isWeekend
                ? SHIFT_GENERATION.REST_DAY_CHANCE_WEEKEND
                : (needsRestDay ? SHIFT_GENERATION.REST_DAY_CHANCE_AFTER_5_DAYS : SHIFT_GENERATION.REST_DAY_CHANCE_WEEKDAY);

            if (Math.random() < restDayChance) {
                // Assign rest day (R) or day off (D)
                const restType: ShiftType = Math.random() > 0.5 ? 'R' : 'D';
                shifts[member.id][dateKey] = [restType];
            } else {
                workingDaysInWeek++;

                // Determine if single or double shift
                const isDoubleShift = Math.random() < SHIFT_GENERATION.DOUBLE_SHIFT_CHANCE;

                if (isDoubleShift) {
                    // Pick a valid double shift combination
                    const combo = VALID_DOUBLE_SHIFTS[Math.floor(Math.random() * VALID_DOUBLE_SHIFTS.length)];
                    shifts[member.id][dateKey] = [...combo];
                } else {
                    // Single working shift
                    const shift = WORKING_SHIFTS[Math.floor(Math.random() * WORKING_SHIFTS.length)];
                    shifts[member.id][dateKey] = [shift];
                }
            }
        }
    });

    return shifts;
}

/**
 * Merge generated shifts with existing shifts.
 * New shifts overwrite existing ones for the same date.
 * @param existingShifts - Current shift data
 * @param newShifts - Generated shift data to merge
 * @returns Merged shift data
 */
export function mergeShifts(existingShifts: ShiftData, newShifts: ShiftData): ShiftData {
    const merged = { ...existingShifts };

    Object.entries(newShifts).forEach(([memberId, memberShifts]) => {
        if (!merged[memberId]) {
            merged[memberId] = {};
        }
        Object.entries(memberShifts).forEach(([date, shifts]) => {
            merged[memberId][date] = shifts;
        });
    });

    return merged;
}
