import { useState } from 'react';
import CalendarView from "./components/CalendarView.tsx";
import {ShiftData, SwapFormData, SwapRequest, TeamMember} from "./Types.ts";
import TeamView from "./components/TeamView.tsx";
import {SHIFT_LEGENDS} from "./ShiftConstants.ts";
import SwapRequestModal from "./components/SwapRequestModal.tsx";


// Mock data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'user' },
    { id: '2', name: 'Mike Chen', role: 'user' },
    { id: '3', name: 'Emily Davis', role: 'user' },
    { id: '4', name: 'James Wilson', role: 'user' },
    { id: '5', name: 'Lisa Anderson', role: 'user' },
    { id: '6', name: 'Robert Taylor', role: 'user' },
    { id: '7', name: 'Maria Garcia', role: 'user' },
];

const generateMockShifts = (startDate: Date): ShiftData => {
    const shifts: ShiftData = {};
    const shiftTypes: Array<'M' | 'A' | 'N' | 'R' | 'D'> = ['M', 'A', 'N', 'R', 'D'];

    MOCK_TEAM_MEMBERS.forEach(member => {
        shifts[member.id] = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const numShifts = Math.random() > 0.7 ? 2 : 1;
            const dayShifts: Array<'M' | 'A' | 'N' | 'R' | 'D'> = [];

            for (let j = 0; j < numShifts; j++) {
                let shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                while (dayShifts.includes(shift)) {
                    shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                }
                dayShifts.push(shift);
            }
            shifts[member.id][dateKey] = dayShifts;
        }
    });

    return shifts;
};

// Generate shifts for entire month
const generateMonthShifts = (year: number, month: number, userId: string): ShiftData => {
    const shifts: ShiftData = { [userId]: {} };
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shiftTypes: Array<'M' | 'A' | 'N' | 'R' | 'D'> = ['M', 'A', 'N', 'R', 'D'];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const numShifts = Math.random() > 0.7 ? 2 : 1;
        const dayShifts: Array<'M' | 'A' | 'N' | 'R' | 'D'> = [];

        for (let j = 0; j < numShifts; j++) {
            let shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
            while (dayShifts.includes(shift)) {
                shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
            }
            dayShifts.push(shift);
        }
        shifts[userId][dateKey] = dayShifts;
    }

    return shifts;
};

interface ScheduleTabProps {
    userRole: string;
}

function ScheduleTab({userRole}: ScheduleTabProps) {
    const [scheduleView, setScheduleView] = useState<'team' | 'calendar'>('team');
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(today.setDate(diff));
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [shifts, setShifts] = useState<ShiftData>(() => generateMockShifts(currentWeekStart));
    const [monthShifts, setMonthShifts] = useState<ShiftData>(() =>
        generateMonthShifts(new Date().getFullYear(), new Date().getMonth(), '1')
    );

    const [hoveredShift, setHoveredShift] = useState<string | null>(null);
    const [nameFilter, setNameFilter] = useState('');
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapFormData, setSwapFormData] = useState<SwapFormData | null>(null);
    const [pendingSwaps, setPendingSwaps] = useState<SwapRequest[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const LOGGED_IN_USER_ID = '1';

    // Team view functions
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        return date;
    });

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeekStart(newDate);
        setShifts(generateMockShifts(newDate));
    };

    // Calendar view functions
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
        setMonthShifts(generateMonthShifts(newDate.getFullYear(), newDate.getMonth(), LOGGED_IN_USER_ID));
    };

    const goToToday = () => {
        const today = new Date();
        if (scheduleView === 'team') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const mondayDate = new Date(today.setDate(diff));
            setCurrentWeekStart(mondayDate);
            setShifts(generateMockShifts(mondayDate));
        } else {
            setCurrentMonth(new Date());
            setMonthShifts(generateMonthShifts(today.getFullYear(), today.getMonth(), LOGGED_IN_USER_ID));
        }
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        const days: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < adjustedStart; i++) {
            days.push(null);
        }

        // Add all days in month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDayName = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getWeekRange = () => {
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        return `${formatDate(currentWeekStart)} - ${formatDate(endDate)}`;
    };

    const getMonthYear = () => {
        return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const filteredTeamMembers = MOCK_TEAM_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    const handleShiftClick = (userId: string, date: string, shiftType: 'M' | 'A' | 'N' | 'R' | 'D') => {
        if (shiftType === 'R' || shiftType === 'D') return;

        if (userId === LOGGED_IN_USER_ID) {
            setSwapFormData({
                targetUserId: '',
                targetDate: '',
                targetShift: 'M',
                myDate: date,
                myShift: shiftType,
                myShifts: [],
                targetShifts: [],
            });
        } else {
            setSwapFormData({
                targetUserId: userId,
                targetDate: date,
                targetShift: shiftType,
                myDate: '',
                myShift: 'M',
                myShifts: [],
                targetShifts: [{ date, shiftType }],
            });
        }
        setShowSwapModal(true);
    };

    const getAvailableShifts = (userId: string) => {
        const userShifts: Array<{ date: string; shiftType: 'M' | 'A' | 'N' }> = [];
        const userShiftData = shifts[userId];

        if (!userShiftData) return userShifts;

        Object.entries(userShiftData).forEach(([date, shiftTypes]) => {
            shiftTypes.forEach(shiftType => {
                if (shiftType === 'M' || shiftType === 'A' || shiftType === 'N') {
                    userShifts.push({ date, shiftType });
                }
            });
        });

        return userShifts;
    };

    const handleSwapRequest = async () => {
        if (!swapFormData) return;

        if (!swapFormData.targetUserId || !swapFormData.targetShifts || swapFormData.targetShifts.length === 0 || !swapFormData.myShifts || swapFormData.myShifts.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        // Mock API call with 200ms delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Create swap requests for all combinations of my shifts and target shifts
        const newRequests: SwapRequest[] = [];
        let requestIndex = 0;

        for (const myShift of swapFormData.myShifts) {
            for (const targetShift of swapFormData.targetShifts) {
                newRequests.push({
                    id: `swap_${Date.now()}_${requestIndex++}`,
                    fromUserId: LOGGED_IN_USER_ID,
                    toUserId: swapFormData.targetUserId,
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

        console.log('Swap requests created:', newRequests);

        setPendingSwaps(prev => [...prev, ...newRequests]);
        setShowSwapModal(false);
        setSwapFormData(null);

        const myShiftsCount = swapFormData.myShifts.length;
        const targetShiftsCount = swapFormData.targetShifts.length;
        const shiftsText = myShiftsCount === 1 ? 'shift' : 'shifts';
        const targetText = targetShiftsCount === 1 ? 'shift' : 'shifts';

        alert(`Swap request submitted successfully! ${myShiftsCount} ${shiftsText} for ${targetShiftsCount} ${targetText}. Waiting for approval.`);
    };

    const hasPendingSwap = (userId: string, date: string, shiftType: 'M' | 'A' | 'N' | 'R' | 'D') => {
        return pendingSwaps.some(swap =>
            (swap.fromUserId === userId && swap.fromShift.date === date && swap.fromShift.shiftType === shiftType) ||
            (swap.toUserId === userId && swap.toShift.date === date && swap.toShift.shiftType === shiftType)
        );
    };

    const handleCloseModal = () => {
        setShowSwapModal(false);
        setSwapFormData(null);
    };

    return (
        <div className="space-y-4">
            {/* Header with View Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {scheduleView === 'team' ? 'Team Schedule' : 'My Calendar'}
                            </h2>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {scheduleView === 'team' ? getWeekRange() : getMonthYear()}
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setScheduleView('team')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                                    scheduleView === 'team'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Team Schedule
                            </button>
                            <button
                                onClick={() => setScheduleView('calendar')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                                    scheduleView === 'calendar'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                My Calendar
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Name Filter - Only show in team view */}
                        {scheduleView === 'team' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs w-full sm:w-40"
                                />
                                <svg
                                    className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {nameFilter && (
                                    <button
                                        onClick={() => setNameFilter('')}
                                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => scheduleView === 'team' ? navigateWeek('prev') : navigateMonth('prev')}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title={`Previous ${scheduleView}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => scheduleView === 'team' ? navigateWeek('next') : navigateMonth('next')}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title={`Next ${scheduleView}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {scheduleView === 'team' && nameFilter && (
                    <div className="mt-2 text-xs text-gray-600">
                        Showing {filteredTeamMembers.length} of {MOCK_TEAM_MEMBERS.length} team members
                    </div>
                )}
            </div>

            {/* Team View */}
            {scheduleView === 'team' && (
                <TeamView
                    weekDays={weekDays}
                    filteredTeamMembers={filteredTeamMembers}
                    shifts={shifts}
                    hoveredShift={hoveredShift}
                    setHoveredShift={setHoveredShift}
                    handleShiftClick={handleShiftClick}
                    hasPendingSwap={hasPendingSwap}
                    getDayName={getDayName}
                    formatDate={formatDate}
                    nameFilter={nameFilter}
                    userRole={userRole}
                    currentMonth={currentMonth}
                />
            )}

            {/* Calendar View - Calendar Grid */}
            {scheduleView === 'calendar' && (
                <CalendarView
                    getDaysInMonth={getDaysInMonth}
                    monthShifts={monthShifts}
                    LOGGED_IN_USER_ID={LOGGED_IN_USER_ID}
                    isToday={isToday}
                    setSelectedDate={setSelectedDate}
                />
            )}

            {/* Legend */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Shift Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(SHIFT_LEGENDS).map(([code, info]) => (
                        <div key={code} className="flex items-center gap-1.5">
                            <div className={`${info.color} w-6 h-6 rounded flex items-center justify-center font-semibold text-xs flex-shrink-0`}>
                                {code}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{info.label}</div>
                                <div className="text-[10px] text-gray-500 truncate">{info.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day Detail Modal - Shown when clicking a date in calendar view */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </h2>
                                    {isToday(selectedDate) && (
                                        <span className="text-sm text-blue-600 font-medium">Today</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(() => {
                                    const dateKey = selectedDate.toISOString().split('T')[0];
                                    const dayShifts = monthShifts[LOGGED_IN_USER_ID]?.[dateKey] || [];

                                    if (dayShifts.length === 0) {
                                        return (
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-2">📅</div>
                                                <div className="text-gray-500">No shifts scheduled</div>
                                            </div>
                                        );
                                    }

                                    return dayShifts.map((shift, idx) => {
                                        const shiftInfo = SHIFT_LEGENDS[shift];
                                        const isPending = hasPendingSwap(LOGGED_IN_USER_ID, dateKey, shift);
                                        const isClickable = shift !== 'R' && shift !== 'D';

                                        return (
                                            <div
                                                key={idx}
                                                className={`${shiftInfo.color} p-4 rounded-lg ${
                                                    isPending ? 'ring-2 ring-yellow-400' : ''
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${shiftInfo.dotColor}`}></div>
                                                        <div className="font-semibold">{shiftInfo.label}</div>
                                                    </div>
                                                    {isPending && (
                                                        <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                                                            <span>⏳</span> Swap Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm mb-3">{shiftInfo.time}</div>
                                                {isClickable && !isPending && (
                                                    <button
                                                        onClick={() => {
                                                            handleShiftClick(LOGGED_IN_USER_ID, dateKey, shift);
                                                            setSelectedDate(null);
                                                        }}
                                                        className="w-full bg-white bg-opacity-50 hover:bg-opacity-70 px-3 py-2 rounded text-sm font-medium transition"
                                                    >
                                                        Request Swap
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            <button
                                onClick={() => setSelectedDate(null)}
                                className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Swap Request Modal */}
            <SwapRequestModal
                isOpen={showSwapModal}
                swapFormData={swapFormData}
                onClose={handleCloseModal}
                onSubmit={handleSwapRequest}
                onUpdateFormData={setSwapFormData}
                teamMembers={MOCK_TEAM_MEMBERS}
                loggedInUserId={LOGGED_IN_USER_ID}
                getAvailableShifts={getAvailableShifts}
            />
        </div>
    );
}

export default ScheduleTab;