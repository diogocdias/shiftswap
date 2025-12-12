import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SwapRequest, isMultiPersonSwap, AnySwapRequest } from '../Types';

// Shift type colors matching ShiftConstants
const SHIFT_COLORS: Record<string, string> = {
    M: 'bg-yellow-100 text-yellow-800',
    A: 'bg-orange-100 text-orange-800',
    N: 'bg-blue-100 text-blue-800',
    Morning: 'bg-yellow-100 text-yellow-800',
    Afternoon: 'bg-orange-100 text-orange-800',
    Night: 'bg-blue-100 text-blue-800',
    Day: 'bg-yellow-100 text-yellow-800',
};

// Get shift abbreviation from type string
const getShiftAbbrev = (shiftType: string): string => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type.includes('day')) return 'M';
    if (type.includes('afternoon')) return 'A';
    if (type.includes('night')) return 'N';
    return '?';
};

// Get color for shift type
const getShiftColor = (shiftType: string): string => {
    const abbrev = getShiftAbbrev(shiftType);
    return SHIFT_COLORS[abbrev] || 'bg-gray-100 text-gray-800';
};

interface ShiftChange {
    date: string;
    userId: string;
    userName: string;
    before: string | null;
    after: string | null;
}

interface SwapPreviewModalProps {
    isOpen: boolean;
    request: AnySwapRequest;
    onClose: () => void;
}

export function SwapPreviewModal({ isOpen, request, onClose }: SwapPreviewModalProps) {
    const { t } = useTranslation();

    // Calculate all shift changes from the request
    const { participants, changes, dates } = useMemo(() => {
        const changesMap: Record<string, ShiftChange> = {};
        const participantsMap: Record<string, string> = {};
        const datesSet = new Set<string>();

        if (isMultiPersonSwap(request)) {
            // Multi-person swap
            request.participants.forEach(p => {
                participantsMap[p.id] = p.name;
            });

            request.transfers.forEach(transfer => {
                const date = transfer.shift.date;
                const shiftType = getShiftAbbrev(transfer.shift.type);
                datesSet.add(date);

                // From user loses this shift
                const fromKey = `${transfer.fromUserId}-${date}`;
                if (!changesMap[fromKey]) {
                    changesMap[fromKey] = {
                        date,
                        userId: transfer.fromUserId,
                        userName: transfer.fromUserName,
                        before: shiftType,
                        after: null,
                    };
                } else {
                    changesMap[fromKey].before = shiftType;
                }

                // To user gains this shift
                const toKey = `${transfer.toUserId}-${date}`;
                if (!changesMap[toKey]) {
                    changesMap[toKey] = {
                        date,
                        userId: transfer.toUserId,
                        userName: transfer.toUserName,
                        before: null,
                        after: shiftType,
                    };
                } else {
                    changesMap[toKey].after = shiftType;
                }
            });
        } else {
            // Regular two-person swap
            participantsMap[request.fromId] = request.from;
            participantsMap[request.toId] = request.to;

            // Get all shifts involved
            const fromShifts = request.fromShifts || [request.fromShift];
            const toShifts = request.toShifts || [request.toShift];

            // From user's shifts go to To user
            fromShifts.forEach(shift => {
                const date = shift.date;
                const shiftType = getShiftAbbrev(shift.type);
                datesSet.add(date);

                // From user loses this shift
                const fromKey = `${request.fromId}-${date}`;
                changesMap[fromKey] = {
                    date,
                    userId: request.fromId,
                    userName: request.from,
                    before: shiftType,
                    after: null,
                };

                // To user gains this shift
                const toKey = `${request.toId}-${date}`;
                if (!changesMap[toKey]) {
                    changesMap[toKey] = {
                        date,
                        userId: request.toId,
                        userName: request.to,
                        before: null,
                        after: shiftType,
                    };
                } else {
                    changesMap[toKey].after = shiftType;
                }
            });

            // To user's shifts go to From user
            toShifts.forEach(shift => {
                const date = shift.date;
                const shiftType = getShiftAbbrev(shift.type);
                datesSet.add(date);

                // To user loses this shift
                const toKey = `${request.toId}-${date}`;
                if (!changesMap[toKey]) {
                    changesMap[toKey] = {
                        date,
                        userId: request.toId,
                        userName: request.to,
                        before: shiftType,
                        after: null,
                    };
                } else {
                    changesMap[toKey].before = shiftType;
                }

                // From user gains this shift
                const fromKey = `${request.fromId}-${date}`;
                if (!changesMap[fromKey]) {
                    changesMap[fromKey] = {
                        date,
                        userId: request.fromId,
                        userName: request.from,
                        before: null,
                        after: shiftType,
                    };
                } else {
                    changesMap[fromKey].after = shiftType;
                }
            });
        }

        // Sort dates
        const sortedDates = Array.from(datesSet).sort((a, b) => {
            // Parse "Dec 15" format
            const parseDate = (d: string) => {
                const months: Record<string, number> = {
                    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
                };
                const parts = d.split(' ');
                const month = months[parts[0]] || 0;
                const day = parseInt(parts[1]) || 1;
                return new Date(2024, month, day).getTime();
            };
            return parseDate(a) - parseDate(b);
        });

        return {
            participants: participantsMap,
            changes: Object.values(changesMap),
            dates: sortedDates,
        };
    }, [request]);

    // Group changes by user for the table
    const changesByUser = useMemo(() => {
        const grouped: Record<string, Record<string, ShiftChange>> = {};

        Object.keys(participants).forEach(userId => {
            grouped[userId] = {};
        });

        changes.forEach(change => {
            if (!grouped[change.userId]) {
                grouped[change.userId] = {};
            }
            grouped[change.userId][change.date] = change;
        });

        return grouped;
    }, [changes, participants]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                            <div className="w-6 h-6 rounded border-2 border-red-400 bg-red-50 flex items-center justify-center">
                                <span className="line-through text-red-600">M</span>
                            </div>
                            <span className="text-gray-600">{t('requests.preview.removed')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border-2 border-green-400 bg-green-50 flex items-center justify-center">
                                <span className="text-green-700 font-bold">M</span>
                            </div>
                            <span className="text-gray-600">{t('requests.preview.added')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400">-</span>
                            </div>
                            <span className="text-gray-600">{t('requests.preview.noChange')}</span>
                        </div>
                    </div>

                    {/* Schedule Preview Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 sticky left-0 bg-gray-50">
                                        {t('requests.preview.teamMember')}
                                    </th>
                                    {dates.map(date => (
                                        <th key={date} className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 min-w-[80px]">
                                            {date}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(participants).map(([userId, userName]) => (
                                    <tr key={userId} className="border-b border-gray-100 last:border-b-0">
                                        <td className="px-3 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                                            {userName}
                                        </td>
                                        {dates.map(date => {
                                            const change = changesByUser[userId]?.[date];

                                            if (!change) {
                                                return (
                                                    <td key={date} className="px-3 py-3 text-center">
                                                        <span className="text-gray-300">-</span>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={date} className="px-3 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Before (removed) */}
                                                        {change.before && (
                                                            <div className={`${getShiftColor(change.before)} px-2 py-1 rounded text-xs font-semibold border-2 border-red-400 relative`}>
                                                                <span className="line-through opacity-60">{change.before}</span>
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Arrow if both before and after */}
                                                        {change.before && change.after && (
                                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        )}

                                                        {/* After (added) */}
                                                        {change.after && (
                                                            <div className={`${getShiftColor(change.after)} px-2 py-1 rounded text-xs font-bold border-2 border-green-400 relative`}>
                                                                {change.after}
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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
