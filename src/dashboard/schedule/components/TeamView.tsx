// TeamView.tsx
import { useTranslation } from 'react-i18next';
import { SHIFT_LEGENDS } from "../ShiftConstants.ts";
import { ShiftData, TeamMember, ShiftType, VacationRecord } from "../../../types/domain";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { toISODateString } from "../../../utils/dateUtils";
import { TIME_OFF_TYPES } from "../../../services/timeOffService";

// Type for shift change highlighting in preview mode
export type ShiftChangeType = 'removed' | 'added' | null;

interface WeekViewProps {
    weekDays: Date[];
    filteredTeamMembers: TeamMember[];
    shifts: ShiftData;
    hoveredShift: string | null;
    setHoveredShift: (v: string | null) => void;
    handleShiftClick: (userId: string, date: string, shift: ShiftType) => void;
    hasPendingSwap: (userId: string, date: string, shift: ShiftType) => boolean;
    isShiftSelected: (userId: string, date: string, shift: ShiftType) => boolean;
    getDayName: (date: Date) => string;
    formatDate: (date: Date) => string;
    nameFilter: string;
    currentMonth: Date;
    isExpanded?: boolean;
    getTimeOffForDate?: (userId: string, dateString: string) => VacationRecord | undefined;
    // Optional: for preview mode to highlight changed shifts
    getShiftChangeType?: (userId: string, date: string, shift: ShiftType) => ShiftChangeType;
    isPreviewMode?: boolean;
}

export default function TeamView(props: WeekViewProps) {
    const { t } = useTranslation();
    const {
        weekDays,
        filteredTeamMembers,
        shifts,
        hoveredShift,
        setHoveredShift,
        handleShiftClick,
        hasPendingSwap,
        isShiftSelected,
        getDayName,
        formatDate,
        nameFilter,
        currentMonth,
        isExpanded = false,
        getTimeOffForDate,
        getShiftChangeType,
        isPreviewMode = false,
    } = props;

    // Function to get all days in the current month
    const getMonthDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: Date[] = [];
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        return days;
    };

    // Show month view on desktop for all users
    const isDesktop = useIsDesktop();
    const isMonthView = isDesktop;
    const daysToShow = isMonthView ? getMonthDays() : weekDays;


    return (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${isExpanded ? 'flex-1' : ''}`}>
            <div className="overflow-x-auto">
                <table className={`${isExpanded ? 'w-full table-fixed' : 'w-full'}`}>
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-32">
                            {t('schedule.teamMember')}
                        </th>
                        {/* Show week view on mobile, month view on desktop for admin/teamleader */}
                        {/* Mobile: always show weekDays */}
                        <th className="md:hidden" colSpan={weekDays.length}>
                            <div className="flex">
                                {weekDays.map((day, index) => (
                                    <div key={index} className="px-1.5 py-1.5 text-center min-w-[70px] w-20 flex-1">
                                        <div className="text-xs font-semibold text-gray-900">{getDayName(day)}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{formatDate(day)}</div>
                                    </div>
                                ))}
                            </div>
                        </th>
                        {/* Desktop: show appropriate view based on role */}
                        {daysToShow.map((day, index) => (
                            <th key={index} className={`hidden md:table-cell px-1.5 py-1.5 text-center ${isExpanded ? '' : (isMonthView ? 'min-w-[50px] w-16' : 'min-w-[70px] w-20')}`}>
                                <div className="text-xs font-semibold text-gray-900">{getDayName(day)}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">{formatDate(day)}</div>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                    {filteredTeamMembers.length === 0 ? (
                        <tr>
                            <td colSpan={isMonthView ? daysToShow.length + 1 : weekDays.length + 1} className="px-2 py-6 text-center text-gray-500 text-sm">
                                {t('schedule.noMembersFound', { filter: nameFilter })}
                            </td>
                        </tr>
                    ) : (
                        filteredTeamMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition">
                                <td className="px-2 py-1.5 sticky left-0 bg-white z-10">
                                    <div>
                                        <div className="font-medium text-gray-900 text-xs leading-tight">
                                            {member.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500">{member.role}</div>
                                    </div>
                                </td>

                                {/* Mobile: render week days */}
                                {weekDays.map((day, index) => {
                                    const dateKey = toISODateString(day);
                                    const timeOff = getTimeOffForDate?.(member.id, dateKey);
                                    const dayShifts = shifts[member.id]?.[dateKey] || [];

                                    // If on time off, show grayed out cell
                                    if (timeOff) {
                                        const typeInfo = TIME_OFF_TYPES[timeOff.type];
                                        return (
                                            <td key={`mobile-${index}`} className="md:hidden px-1 py-1.5 text-center relative bg-gray-100">
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    <div className="relative inline-block">
                                                        <div
                                                            className="bg-gray-300 text-gray-600 px-2 py-1 rounded font-semibold text-xs cursor-default opacity-75"
                                                            onMouseEnter={() => setHoveredShift(`timeoff-${member.id}-${dateKey}`)}
                                                            onMouseLeave={() => setHoveredShift(null)}
                                                        >
                                                            {typeInfo.shortLabel}
                                                            {hoveredShift === `timeoff-${member.id}-${dateKey}` && (
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                    <div className="font-semibold">{typeInfo.icon} {typeInfo.label}</div>
                                                                    <div className="text-gray-300 mt-0.5">{t('schedule.tooltips.timeOff')}</div>
                                                                    {timeOff.notes && (
                                                                        <div className="text-gray-400 mt-1">{timeOff.notes}</div>
                                                                    )}
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                        <div className="border-4 border-transparent border-t-gray-900"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={`mobile-${index}`} className="md:hidden px-1 py-1.5 text-center relative">
                                            {dayShifts.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    {dayShifts.map((shift, shiftIndex) => {
                                                        const shiftInfo = SHIFT_LEGENDS[shift];
                                                        const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;
                                                        const isPending = hasPendingSwap(member.id, dateKey, shift);
                                                        const isSelected = isShiftSelected(member.id, dateKey, shift);
                                                        const isClickable = shift !== "R" && shift !== "D" && !isPreviewMode;
                                                        const changeType = getShiftChangeType?.(member.id, dateKey, shift);

                                                        // In preview mode, determine styling based on change type
                                                        const getChangeStyles = () => {
                                                            if (changeType === 'removed') return 'ring-2 ring-red-400 ring-offset-1 opacity-60';
                                                            if (changeType === 'added') return 'ring-2 ring-green-500 ring-offset-1';
                                                            return '';
                                                        };

                                                        return (
                                                            <div key={shiftIndex} className="relative inline-block">
                                                                <div
                                                                    className={`${shiftInfo.color} px-2 py-1 rounded font-semibold text-xs transition-all ${
                                                                        isClickable
                                                                            ? "cursor-pointer hover:scale-110"
                                                                            : "cursor-default"
                                                                    } ${isPending && !isPreviewMode ? "ring-2 ring-yellow-400 ring-offset-1" : ""} ${
                                                                        isSelected && !isPreviewMode ? "ring-2 ring-blue-600 ring-offset-1 scale-110" : ""
                                                                    } ${getChangeStyles()}`}
                                                                    onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                    onMouseLeave={() => setHoveredShift(null)}
                                                                    onClick={() =>
                                                                        isClickable &&
                                                                        handleShiftClick(member.id, dateKey, shift)
                                                                    }
                                                                >
                                                                    {changeType === 'removed' ? <span className="line-through">{shift}</span> : shift}
                                                                    {isSelected && !isPreviewMode && (
                                                                        <span className="ml-0.5 text-blue-600">
                                                                            <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {isPending && !isSelected && !isPreviewMode && (
                                                                        <span className="ml-1 text-yellow-600">
                                                                                ⏳
                                                                            </span>
                                                                    )}
                                                                    {/* Change indicator badges for preview mode */}
                                                                    {changeType === 'removed' && (
                                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {changeType === 'added' && (
                                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {hoveredShift === shiftKey && (
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                            <div className="font-semibold">{shiftInfo.label}</div>
                                                                            <div className="text-gray-300 mt-0.5">{shiftInfo.time}</div>
                                                                            {changeType === 'removed' && (
                                                                                <div className="text-red-300 mt-1 font-semibold">{t('requests.preview.willBeRemoved')}</div>
                                                                            )}
                                                                            {changeType === 'added' && (
                                                                                <div className="text-green-300 mt-1 font-semibold">{t('requests.preview.willBeAdded')}</div>
                                                                            )}
                                                                            {isPending && !isPreviewMode && (
                                                                                <div className="text-yellow-300 mt-1 font-semibold">{t('schedule.tooltips.swapPending')}</div>
                                                                            )}
                                                                            {isSelected && !isPreviewMode && (
                                                                                <div className="text-blue-300 mt-1 font-semibold">{t('schedule.tooltips.selectedClickToDeselect')}</div>
                                                                            )}
                                                                            {isClickable && !isPending && !isSelected && !isPreviewMode && (
                                                                                <div className="text-blue-300 mt-1">{t('schedule.tooltips.clickToSelectForSwap')}</div>
                                                                            )}
                                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                                <div className="border-4 border-transparent border-t-gray-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}

                                {/* Desktop: render appropriate days based on role */}
                                {daysToShow.map((day, index) => {
                                    const dateKey = toISODateString(day);
                                    const timeOff = getTimeOffForDate?.(member.id, dateKey);
                                    const dayShifts = shifts[member.id]?.[dateKey] || [];

                                    // If on time off, show grayed out cell
                                    if (timeOff) {
                                        const typeInfo = TIME_OFF_TYPES[timeOff.type];
                                        return (
                                            <td key={`desktop-${index}`} className="hidden md:table-cell px-1 py-1.5 text-center relative bg-gray-100">
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    <div className="relative inline-block">
                                                        <div
                                                            className={`bg-gray-300 text-gray-600 ${isExpanded ? 'px-2 py-1 text-xs' : (isMonthView ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs')} rounded font-semibold cursor-default opacity-75`}
                                                            onMouseEnter={() => setHoveredShift(`timeoff-${member.id}-${dateKey}`)}
                                                            onMouseLeave={() => setHoveredShift(null)}
                                                        >
                                                            {isMonthView && !isExpanded ? 'OFF' : typeInfo.shortLabel}
                                                            {hoveredShift === `timeoff-${member.id}-${dateKey}` && (
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                    <div className="font-semibold">{typeInfo.icon} {typeInfo.label}</div>
                                                                    <div className="text-gray-300 mt-0.5">{t('schedule.tooltips.timeOff')}</div>
                                                                    {timeOff.notes && (
                                                                        <div className="text-gray-400 mt-1">{timeOff.notes}</div>
                                                                    )}
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                        <div className="border-4 border-transparent border-t-gray-900"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={`desktop-${index}`} className="hidden md:table-cell px-1 py-1.5 text-center relative">
                                            {dayShifts.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    {dayShifts.map((shift, shiftIndex) => {
                                                        const shiftInfo = SHIFT_LEGENDS[shift];
                                                        const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;
                                                        const isPending = hasPendingSwap(member.id, dateKey, shift);
                                                        const isSelected = isShiftSelected(member.id, dateKey, shift);
                                                        const isClickable = shift !== "R" && shift !== "D" && !isPreviewMode;
                                                        const changeType = getShiftChangeType?.(member.id, dateKey, shift);

                                                        // In preview mode, determine styling based on change type
                                                        const getChangeStyles = () => {
                                                            if (changeType === 'removed') return 'ring-2 ring-red-400 ring-offset-1 opacity-60';
                                                            if (changeType === 'added') return 'ring-2 ring-green-500 ring-offset-1';
                                                            return '';
                                                        };

                                                        return (
                                                            <div key={shiftIndex} className="relative inline-block">
                                                                <div
                                                                    className={`${shiftInfo.color} ${isExpanded ? 'px-2 py-1 text-xs' : (isMonthView ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs')} rounded font-semibold transition-all ${
                                                                        isClickable
                                                                            ? "cursor-pointer hover:scale-110"
                                                                            : "cursor-default"
                                                                    } ${isPending && !isPreviewMode ? "ring-2 ring-yellow-400 ring-offset-1" : ""} ${
                                                                        isSelected && !isPreviewMode ? "ring-2 ring-blue-600 ring-offset-1 scale-110" : ""
                                                                    } ${getChangeStyles()}`}
                                                                    onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                    onMouseLeave={() => setHoveredShift(null)}
                                                                    onClick={() =>
                                                                        isClickable &&
                                                                        handleShiftClick(member.id, dateKey, shift)
                                                                    }
                                                                >
                                                                    {changeType === 'removed' ? <span className="line-through">{shift}</span> : shift}
                                                                    {isSelected && !isPreviewMode && (
                                                                        <span className={`${isMonthView && !isExpanded ? 'ml-0' : 'ml-0.5'} text-blue-600`}>
                                                                            <svg className={`${isMonthView && !isExpanded ? 'w-2 h-2' : 'w-3 h-3'} inline`} fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {isPending && !isSelected && !isPreviewMode && (
                                                                        <span className="ml-1 text-yellow-600">
                                                                                ⏳
                                                                            </span>
                                                                    )}
                                                                    {/* Change indicator badges for preview mode */}
                                                                    {changeType === 'removed' && (
                                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {changeType === 'added' && (
                                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {hoveredShift === shiftKey && (
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                            <div className="font-semibold">{shiftInfo.label}</div>
                                                                            <div className="text-gray-300 mt-0.5">{shiftInfo.time}</div>
                                                                            {changeType === 'removed' && (
                                                                                <div className="text-red-300 mt-1 font-semibold">{t('requests.preview.willBeRemoved')}</div>
                                                                            )}
                                                                            {changeType === 'added' && (
                                                                                <div className="text-green-300 mt-1 font-semibold">{t('requests.preview.willBeAdded')}</div>
                                                                            )}
                                                                            {isPending && !isPreviewMode && (
                                                                                <div className="text-yellow-300 mt-1 font-semibold">{t('schedule.tooltips.swapPending')}</div>
                                                                            )}
                                                                            {isSelected && !isPreviewMode && (
                                                                                <div className="text-blue-300 mt-1 font-semibold">{t('schedule.tooltips.selectedClickToDeselect')}</div>
                                                                            )}
                                                                            {isClickable && !isPending && !isSelected && !isPreviewMode && (
                                                                                <div className="text-blue-300 mt-1">{t('schedule.tooltips.clickToSelectForSwap')}</div>
                                                                            )}
                                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                                <div className="border-4 border-transparent border-t-gray-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}