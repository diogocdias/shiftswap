import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SwapRequest, isMultiPersonSwap, AnySwapRequest } from '../Types';
import { SHIFT_LEGENDS } from '../../schedule/ShiftConstants';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

type ShiftType = keyof typeof SHIFT_LEGENDS;

// Get shift abbreviation from type string
const getShiftAbbrev = (shiftType: string): ShiftType => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type === 'm') return 'M';
    if (type.includes('afternoon') || type === 'a') return 'A';
    if (type.includes('night') || type === 'n') return 'N';
    if (type.includes('day') && !type.includes('off')) return 'M';
    return 'M'; // Default fallback
};

interface ShiftChange {
    before: ShiftType | null;
    after: ShiftType | null;
}

interface SwapPreviewModalProps {
    isOpen: boolean;
    request: AnySwapRequest;
    onClose: () => void;
}

export function SwapPreviewModal({ isOpen, request, onClose }: SwapPreviewModalProps) {
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();
    const [hoveredShift, setHoveredShift] = useState<string | null>(null);

    // Calculate all shift changes from the request
    const { participants, dates, changesByUserAndDate } = useMemo(() => {
        const participantsMap: Map<string, string> = new Map();
        const datesSet = new Set<string>();
        const changesMap: Map<string, Map<string, ShiftChange>> = new Map();

        if (isMultiPersonSwap(request)) {
            // Multi-person swap
            request.participants.forEach(p => {
                participantsMap.set(p.id, p.name);
                changesMap.set(p.id, new Map());
            });

            request.transfers.forEach(transfer => {
                const date = transfer.shift.date;
                const shiftType = getShiftAbbrev(transfer.shift.type);
                datesSet.add(date);

                // From user loses this shift
                const fromChanges = changesMap.get(transfer.fromUserId);
                if (fromChanges) {
                    const existing = fromChanges.get(date) || { before: null, after: null };
                    existing.before = shiftType;
                    fromChanges.set(date, existing);
                }

                // To user gains this shift
                const toChanges = changesMap.get(transfer.toUserId);
                if (toChanges) {
                    const existing = toChanges.get(date) || { before: null, after: null };
                    existing.after = shiftType;
                    toChanges.set(date, existing);
                }
            });
        } else {
            // Regular two-person swap
            participantsMap.set(request.fromId, request.from);
            participantsMap.set(request.toId, request.to);
            changesMap.set(request.fromId, new Map());
            changesMap.set(request.toId, new Map());

            // Get all shifts involved
            const fromShifts = request.fromShifts || [request.fromShift];
            const toShifts = request.toShifts || [request.toShift];

            // From user's shifts go to To user
            fromShifts.forEach(shift => {
                const date = shift.date;
                const shiftType = getShiftAbbrev(shift.type);
                datesSet.add(date);

                // From user loses this shift
                const fromChanges = changesMap.get(request.fromId)!;
                const fromExisting = fromChanges.get(date) || { before: null, after: null };
                fromExisting.before = shiftType;
                fromChanges.set(date, fromExisting);

                // To user gains this shift
                const toChanges = changesMap.get(request.toId)!;
                const toExisting = toChanges.get(date) || { before: null, after: null };
                toExisting.after = shiftType;
                toChanges.set(date, toExisting);
            });

            // To user's shifts go to From user
            toShifts.forEach(shift => {
                const date = shift.date;
                const shiftType = getShiftAbbrev(shift.type);
                datesSet.add(date);

                // To user loses this shift
                const toChanges = changesMap.get(request.toId)!;
                const toExisting = toChanges.get(date) || { before: null, after: null };
                toExisting.before = shiftType;
                toChanges.set(date, toExisting);

                // From user gains this shift
                const fromChanges = changesMap.get(request.fromId)!;
                const fromExisting = fromChanges.get(date) || { before: null, after: null };
                fromExisting.after = shiftType;
                fromChanges.set(date, fromExisting);
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
            dates: sortedDates,
            changesByUserAndDate: changesMap,
        };
    }, [request]);

    if (!isOpen) return null;

    // Render a shift badge (following TeamView style)
    const renderShiftBadge = (
        shift: ShiftType,
        variant: 'removed' | 'added' | 'normal',
        hoverKey: string
    ) => {
        const shiftInfo = SHIFT_LEGENDS[shift];
        const isHovered = hoveredShift === hoverKey;

        // Base styling from TeamView
        const baseClasses = `${shiftInfo.color} rounded font-semibold transition-all`;
        const sizeClasses = isDesktop ? 'px-2 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]';

        // Variant-specific styling
        let variantClasses = '';
        let indicator = null;

        if (variant === 'removed') {
            variantClasses = 'ring-2 ring-red-400 ring-offset-1 opacity-60';
            indicator = (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                    </svg>
                </span>
            );
        } else if (variant === 'added') {
            variantClasses = 'ring-2 ring-green-500 ring-offset-1';
            indicator = (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                </span>
            );
        }

        return (
            <div className="relative inline-block">
                <div
                    className={`${baseClasses} ${sizeClasses} ${variantClasses}`}
                    onMouseEnter={() => setHoveredShift(hoverKey)}
                    onMouseLeave={() => setHoveredShift(null)}
                >
                    {variant === 'removed' ? <span className="line-through">{shift}</span> : shift}
                    {indicator}
                </div>
                {/* Tooltip */}
                {isHovered && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                        <div className="font-semibold">{shiftInfo.label}</div>
                        <div className="text-gray-300 mt-0.5">{shiftInfo.time}</div>
                        {variant === 'removed' && (
                            <div className="text-red-300 mt-1 font-semibold">{t('requests.preview.willBeRemoved')}</div>
                        )}
                        {variant === 'added' && (
                            <div className="text-green-300 mt-1 font-semibold">{t('requests.preview.willBeAdded')}</div>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

                    {/* Schedule Preview Table - following TeamView design */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-32">
                                            {t('schedule.teamMember')}
                                        </th>
                                        {dates.map((date, index) => (
                                            <th
                                                key={index}
                                                className={`px-1.5 py-1.5 text-center ${isDesktop ? 'min-w-[80px] w-24' : 'min-w-[70px] w-20'}`}
                                            >
                                                <div className="text-xs font-semibold text-gray-900">{date}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Array.from(participants.entries()).map(([userId, userName]) => (
                                        <tr key={userId} className="hover:bg-gray-50 transition">
                                            <td className="px-2 py-1.5 sticky left-0 bg-white z-10">
                                                <div className="font-medium text-gray-900 text-xs leading-tight">
                                                    {userName}
                                                </div>
                                            </td>
                                            {dates.map((date, dateIndex) => {
                                                const change = changesByUserAndDate.get(userId)?.get(date);

                                                return (
                                                    <td key={dateIndex} className="px-1 py-1.5 text-center relative">
                                                        <div className="flex flex-wrap gap-1 justify-center items-center">
                                                            {change?.before && renderShiftBadge(
                                                                change.before,
                                                                'removed',
                                                                `${userId}-${date}-before`
                                                            )}
                                                            {change?.before && change?.after && (
                                                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                </svg>
                                                            )}
                                                            {change?.after && renderShiftBadge(
                                                                change.after,
                                                                'added',
                                                                `${userId}-${date}-after`
                                                            )}
                                                            {!change && (
                                                                <span className="text-gray-300">-</span>
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
