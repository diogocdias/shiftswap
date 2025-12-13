import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SwapRequest, isMultiPersonSwap, AnySwapRequest } from '../Types';
import TeamView, { ShiftChangeType } from '../../schedule/components/TeamView';
import { ShiftData, TeamMember, ShiftType } from '../../../types/domain';
import { generateMonthShiftsForTeam } from '../../../utils/shiftGenerator';
import { getWeekStart, getWeekDays, formatShortDate, getDayName } from '../../../utils/dateUtils';

// Mock team members - same as ScheduleTab
// In a real app, this would come from context/API
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'user' },
    { id: '2', name: 'Mike Chen', role: 'user' },
    { id: '3', name: 'Emily Davis', role: 'user' },
    { id: '4', name: 'James Wilson', role: 'user' },
    { id: '5', name: 'Lisa Anderson', role: 'user' },
    { id: '6', name: 'Robert Taylor', role: 'user' },
    { id: '7', name: 'Maria Garcia', role: 'user' },
];

// Get shift abbreviation from type string
const getShiftAbbrev = (shiftType: string): ShiftType => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type === 'm') return 'M';
    if (type.includes('afternoon') || type === 'a') return 'A';
    if (type.includes('night') || type === 'n') return 'N';
    if (type.includes('day') && !type.includes('off')) return 'M';
    return 'M'; // Default fallback
};

// Parse date string like "Dec 15" to ISO format
const parseDateToISO = (dateStr: string): string => {
    const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const parts = dateStr.split(' ');
    const month = months[parts[0]] ?? new Date().getMonth();
    const day = parseInt(parts[1]) || 1;
    const year = new Date().getFullYear();
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
};

interface ShiftChange {
    userId: string;
    date: string; // ISO format
    shiftType: ShiftType;
    changeType: 'removed' | 'added';
}

interface SwapPreviewModalProps {
    isOpen: boolean;
    request: AnySwapRequest;
    onClose: () => void;
}

export function SwapPreviewModal({ isOpen, request, onClose }: SwapPreviewModalProps) {
    const { t } = useTranslation();
    const [hoveredShift, setHoveredShift] = useState<string | null>(null);

    // Calculate all shift changes from the request
    const changes = useMemo<ShiftChange[]>(() => {
        const result: ShiftChange[] = [];

        if (isMultiPersonSwap(request)) {
            // Multi-person swap
            request.transfers.forEach(transfer => {
                const dateISO = parseDateToISO(transfer.shift.date);
                const shiftType = getShiftAbbrev(transfer.shift.type);

                // From user loses this shift
                result.push({
                    userId: transfer.fromUserId,
                    date: dateISO,
                    shiftType,
                    changeType: 'removed',
                });

                // To user gains this shift
                result.push({
                    userId: transfer.toUserId,
                    date: dateISO,
                    shiftType,
                    changeType: 'added',
                });
            });
        } else {
            // Regular two-person swap
            const fromShifts = request.fromShifts || [request.fromShift];
            const toShifts = request.toShifts || [request.toShift];

            // From user's shifts go to To user
            fromShifts.forEach(shift => {
                const dateISO = parseDateToISO(shift.date);
                const shiftType = getShiftAbbrev(shift.type);

                // From user loses this shift
                result.push({
                    userId: request.fromId,
                    date: dateISO,
                    shiftType,
                    changeType: 'removed',
                });

                // To user gains this shift
                result.push({
                    userId: request.toId,
                    date: dateISO,
                    shiftType,
                    changeType: 'added',
                });
            });

            // To user's shifts go to From user
            toShifts.forEach(shift => {
                const dateISO = parseDateToISO(shift.date);
                const shiftType = getShiftAbbrev(shift.type);

                // To user loses this shift
                result.push({
                    userId: request.toId,
                    date: dateISO,
                    shiftType,
                    changeType: 'removed',
                });

                // From user gains this shift
                result.push({
                    userId: request.fromId,
                    date: dateISO,
                    shiftType,
                    changeType: 'added',
                });
            });
        }

        return result;
    }, [request]);

    // Generate schedule data with the changes applied
    const { shifts, currentMonth, weekDays } = useMemo(() => {
        // Get the relevant dates from changes
        const dates = changes.map(c => new Date(c.date));
        const firstDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();

        // Generate schedule for that month
        const month = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
        const baseShifts = generateMonthShiftsForTeam(month.getFullYear(), month.getMonth(), MOCK_TEAM_MEMBERS);

        // Create a copy with the added shifts included
        const modifiedShifts: ShiftData = JSON.parse(JSON.stringify(baseShifts));

        // Add the "added" shifts to the schedule
        changes.filter(c => c.changeType === 'added').forEach(change => {
            if (!modifiedShifts[change.userId]) {
                modifiedShifts[change.userId] = {};
            }
            if (!modifiedShifts[change.userId][change.date]) {
                modifiedShifts[change.userId][change.date] = [];
            }
            // Only add if not already present
            if (!modifiedShifts[change.userId][change.date].includes(change.shiftType)) {
                modifiedShifts[change.userId][change.date].push(change.shiftType);
            }
        });

        // Also ensure "removed" shifts exist in the data so they can be displayed
        changes.filter(c => c.changeType === 'removed').forEach(change => {
            if (!modifiedShifts[change.userId]) {
                modifiedShifts[change.userId] = {};
            }
            if (!modifiedShifts[change.userId][change.date]) {
                modifiedShifts[change.userId][change.date] = [];
            }
            // Only add if not already present (might have been generated)
            if (!modifiedShifts[change.userId][change.date].includes(change.shiftType)) {
                modifiedShifts[change.userId][change.date].push(change.shiftType);
            }
        });

        const weekStart = getWeekStart(firstDate);

        return {
            shifts: modifiedShifts,
            currentMonth: month,
            weekDays: getWeekDays(weekStart),
        };
    }, [changes]);

    // Create the getShiftChangeType function for TeamView
    const getShiftChangeType = useCallback((userId: string, date: string, shift: ShiftType): ShiftChangeType => {
        const change = changes.find(c =>
            c.userId === userId &&
            c.date === date &&
            c.shiftType === shift
        );
        return change?.changeType ?? null;
    }, [changes]);

    // Dummy functions for TeamView (preview mode doesn't need these)
    const noOp = useCallback(() => {}, []);
    const returnFalse = useCallback(() => false, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('requests.preview.title')}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {t('requests.preview.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold ring-2 ring-red-400 ring-offset-1 opacity-60">
                                    <span className="line-through">M</span>
                                </div>
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                    </svg>
                                </span>
                            </div>
                            <span className="text-gray-600">{t('requests.preview.removed')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold ring-2 ring-green-500 ring-offset-1">
                                    M
                                </div>
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </div>
                            <span className="text-gray-600">{t('requests.preview.added')}</span>
                        </div>
                    </div>

                    {/* Schedule Preview - using actual TeamView */}
                    <TeamView
                        weekDays={weekDays}
                        filteredTeamMembers={MOCK_TEAM_MEMBERS}
                        shifts={shifts}
                        hoveredShift={hoveredShift}
                        setHoveredShift={setHoveredShift}
                        handleShiftClick={noOp}
                        hasPendingSwap={returnFalse}
                        isShiftSelected={returnFalse}
                        getDayName={getDayName}
                        formatDate={formatShortDate}
                        nameFilter=""
                        currentMonth={currentMonth}
                        isPreviewMode={true}
                        getShiftChangeType={getShiftChangeType}
                    />

                    {/* Summary */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                            <span className="font-medium">{t('requests.preview.summary')}:</span>{' '}
                            {isMultiPersonSwap(request)
                                ? t('requests.preview.multiPersonSummary', {
                                    count: request.transfers.length,
                                    participants: request.participants.length
                                })
                                : t('requests.preview.twoPersonSummary', {
                                    from: (request as SwapRequest).from,
                                    to: (request as SwapRequest).to
                                })
                            }
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
