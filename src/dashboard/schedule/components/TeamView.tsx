// WeekView.tsx
import { SHIFT_LEGENDS } from "../ShiftConstants.ts";
import {ShiftData, TeamMember} from "../Types.ts";
import {useEffect, useState} from "react";

interface WeekViewProps {
    weekDays: Date[];
    filteredTeamMembers: TeamMember[];
    shifts: ShiftData;
    hoveredShift: string | null;
    setHoveredShift: (v: string | null) => void;
    handleShiftClick: (userId: string, date: string, shift: 'M' | 'A' | 'N' | 'R' | 'D') => void;
    hasPendingSwap: (userId: string, date: string, shift: 'M' | 'A' | 'N' | 'R' | 'D') => boolean;
    getDayName: (date: Date) => string;
    formatDate: (date: Date) => string;
    nameFilter: string;
    userRole?: string;
    currentMonth: Date;
    isExpanded?: boolean;
}

export default function TeamView(props: WeekViewProps) {
    const {
        weekDays,
        filteredTeamMembers,
        shifts,
        hoveredShift,
        setHoveredShift,
        handleShiftClick,
        hasPendingSwap,
        getDayName,
        formatDate,
        nameFilter,
        userRole = 'user',
        currentMonth,
        isExpanded = false
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

    // Only show month view if both conditions are met:
    // 1. User is admin or teamleader
    // 2. Screen is desktop
    const isDesktop = useIsDesktop();
    const isMonthView = isDesktop && (userRole === 'admin' || userRole === 'teamleader');
    const daysToShow = isMonthView ? getMonthDays() : weekDays;


    return (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${isExpanded ? 'flex-1' : ''}`}>
            <div className="overflow-x-auto">
                <table className={`${isExpanded ? 'w-full table-fixed' : 'w-full'}`}>
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-32">
                            Team Member
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
                                No team members found matching "{nameFilter}"
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
                                    const dateKey = day.toISOString().split("T")[0];
                                    const dayShifts = shifts[member.id]?.[dateKey] || [];

                                    return (
                                        <td key={`mobile-${index}`} className="md:hidden px-1 py-1.5 text-center relative">
                                            {dayShifts.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    {dayShifts.map((shift, shiftIndex) => {
                                                        const shiftInfo = SHIFT_LEGENDS[shift];
                                                        const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;
                                                        const isPending = hasPendingSwap(member.id, dateKey, shift);
                                                        const isClickable = shift !== "R" && shift !== "D";

                                                        return (
                                                            <div key={shiftIndex} className="relative inline-block">
                                                                <div
                                                                    className={`${shiftInfo.color} px-2 py-1 rounded font-semibold text-xs transition-transform ${
                                                                        isClickable
                                                                            ? "cursor-pointer hover:scale-110"
                                                                            : "cursor-default"
                                                                    } ${isPending ? "ring-2 ring-yellow-400 ring-offset-1" : ""}`}
                                                                    onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                    onMouseLeave={() => setHoveredShift(null)}
                                                                    onClick={() =>
                                                                        isClickable &&
                                                                        handleShiftClick(member.id, dateKey, shift)
                                                                    }
                                                                >
                                                                    {shift}
                                                                    {isPending && (
                                                                        <span className="ml-1 text-yellow-600">
                                                                                ⏳
                                                                            </span>
                                                                    )}
                                                                    {hoveredShift === shiftKey && (
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                            <div className="font-semibold">{shiftInfo.label}</div>
                                                                            <div className="text-gray-300 mt-0.5">{shiftInfo.time}</div>
                                                                            {isPending && (
                                                                                <div className="text-yellow-300 mt-1 font-semibold">Swap Pending</div>
                                                                            )}
                                                                            {isClickable && !isPending && (
                                                                                <div className="text-blue-300 mt-1">Click to request swap</div>
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
                                    const dateKey = day.toISOString().split("T")[0];
                                    const dayShifts = shifts[member.id]?.[dateKey] || [];

                                    return (
                                        <td key={`desktop-${index}`} className="hidden md:table-cell px-1 py-1.5 text-center relative">
                                            {dayShifts.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    {dayShifts.map((shift, shiftIndex) => {
                                                        const shiftInfo = SHIFT_LEGENDS[shift];
                                                        const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;
                                                        const isPending = hasPendingSwap(member.id, dateKey, shift);
                                                        const isClickable = shift !== "R" && shift !== "D";

                                                        return (
                                                            <div key={shiftIndex} className="relative inline-block">
                                                                <div
                                                                    className={`${shiftInfo.color} ${isExpanded ? 'px-2 py-1 text-xs' : (isMonthView ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs')} rounded font-semibold transition-transform ${
                                                                        isClickable
                                                                            ? "cursor-pointer hover:scale-110"
                                                                            : "cursor-default"
                                                                    } ${isPending ? "ring-2 ring-yellow-400 ring-offset-1" : ""}`}
                                                                    onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                    onMouseLeave={() => setHoveredShift(null)}
                                                                    onClick={() =>
                                                                        isClickable &&
                                                                        handleShiftClick(member.id, dateKey, shift)
                                                                    }
                                                                >
                                                                    {shift}
                                                                    {isPending && (
                                                                        <span className="ml-1 text-yellow-600">
                                                                                ⏳
                                                                            </span>
                                                                    )}
                                                                    {hoveredShift === shiftKey && (
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 shadow-lg">
                                                                            <div className="font-semibold">{shiftInfo.label}</div>
                                                                            <div className="text-gray-300 mt-0.5">{shiftInfo.time}</div>
                                                                            {isPending && (
                                                                                <div className="text-yellow-300 mt-1 font-semibold">Swap Pending</div>
                                                                            )}
                                                                            {isClickable && !isPending && (
                                                                                <div className="text-blue-300 mt-1">Click to request swap</div>
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


function useIsDesktop() {
    const getCurrentState = () =>
        typeof window !== "undefined" ? window.innerWidth >= 1024 : false;

    const [isDesktop, setIsDesktop] = useState(getCurrentState);

    useEffect(() => {
        const update = () => {
            setIsDesktop(getCurrentState());
        };

        // Handle resizing & rotation events
        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);

    return isDesktop;
}