import { useState } from 'react';

interface ShiftData {
    [personId: string]: {
        [date: string]: Array<'M' | 'A' | 'N' | 'R' | 'D'>;
    };
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
}

interface SwapRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromShift: {
        date: string;
        shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
    };
    toShift: {
        date: string;
        shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
    };
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
}

interface SwapFormData {
    targetUserId: string;
    targetDate: string;
    targetShift: 'M' | 'A' | 'N' | 'R' | 'D';
    myDate: string;
    myShift: 'M' | 'A' | 'N' | 'R' | 'D';
}

// Mock data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'RN' },
    { id: '2', name: 'Mike Chen', role: 'RN' },
    { id: '3', name: 'Emily Davis', role: 'LPN' },
    { id: '4', name: 'James Wilson', role: 'RN' },
    { id: '5', name: 'Lisa Anderson', role: 'CNA' },
    { id: '6', name: 'Robert Taylor', role: 'RN' },
    { id: '7', name: 'Maria Garcia', role: 'LPN' },
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

const SHIFT_LEGENDS = {
    M: { label: 'Morning Shift', time: '6:00 AM - 2:00 PM', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
    A: { label: 'Afternoon Shift', time: '2:00 PM - 10:00 PM', color: 'bg-orange-100 text-orange-800', dotColor: 'bg-orange-500' },
    N: { label: 'Night Shift', time: '10:00 PM - 6:00 AM', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
    R: { label: 'Rest Day', time: 'No work scheduled', color: 'bg-green-50 text-green-600 opacity-60', dotColor: 'bg-green-400' },
    D: { label: 'Day Off', time: 'Personal day off', color: 'bg-gray-50 text-gray-500 opacity-60', dotColor: 'bg-gray-400' },
};

function ScheduleTab() {
    const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week');
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

    // Week view functions
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

    // Month view functions
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
        setMonthShifts(generateMonthShifts(newDate.getFullYear(), newDate.getMonth(), LOGGED_IN_USER_ID));
    };

    const goToToday = () => {
        const today = new Date();
        if (scheduleView === 'week') {
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
            });
        } else {
            setSwapFormData({
                targetUserId: userId,
                targetDate: date,
                targetShift: shiftType,
                myDate: '',
                myShift: 'M',
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

        if (!swapFormData.targetUserId || !swapFormData.targetDate || !swapFormData.myDate) {
            alert('Please fill in all required fields');
            return;
        }

        const newRequest: SwapRequest = {
            id: `swap_${Date.now()}`,
            fromUserId: LOGGED_IN_USER_ID,
            toUserId: swapFormData.targetUserId,
            fromShift: {
                date: swapFormData.myDate,
                shiftType: swapFormData.myShift,
            },
            toShift: {
                date: swapFormData.targetDate,
                shiftType: swapFormData.targetShift,
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Swap request created:', newRequest);

        setPendingSwaps(prev => [...prev, newRequest]);
        setShowSwapModal(false);
        setSwapFormData(null);
        alert('Swap request submitted successfully! Waiting for approval.');
    };

    const hasPendingSwap = (userId: string, date: string, shiftType: 'M' | 'A' | 'N' | 'R' | 'D') => {
        return pendingSwaps.some(swap =>
            (swap.fromUserId === userId && swap.fromShift.date === date && swap.fromShift.shiftType === shiftType) ||
            (swap.toUserId === userId && swap.toShift.date === date && swap.toShift.shiftType === shiftType)
        );
    };

    return (
        <div className="space-y-4">
            {/* Header with View Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {scheduleView === 'week' ? 'Team Schedule' : 'My Calendar'}
                            </h2>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {scheduleView === 'week' ? getWeekRange() : getMonthYear()}
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setScheduleView('week')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                                    scheduleView === 'week'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setScheduleView('month')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                                    scheduleView === 'month'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Month
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Name Filter - Only show in week view */}
                        {scheduleView === 'week' && (
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
                                onClick={() => scheduleView === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
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
                                onClick={() => scheduleView === 'week' ? navigateWeek('next') : navigateMonth('next')}
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

                {scheduleView === 'week' && nameFilter && (
                    <div className="mt-2 text-xs text-gray-600">
                        Showing {filteredTeamMembers.length} of {MOCK_TEAM_MEMBERS.length} team members
                    </div>
                )}
            </div>

            {/* Week View */}
            {scheduleView === 'week' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-32">
                                    Team Member
                                </th>
                                {weekDays.map((day, index) => (
                                    <th key={index} className="px-1.5 py-1.5 text-center min-w-[70px] w-20">
                                        <div className="text-xs font-semibold text-gray-900">{getDayName(day)}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{formatDate(day)}</div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredTeamMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-2 py-6 text-center text-gray-500 text-sm">
                                        No team members found matching "{nameFilter}"
                                    </td>
                                </tr>
                            ) : (
                                filteredTeamMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition">
                                        <td className="px-2 py-1.5 sticky left-0 bg-white z-10">
                                            <div>
                                                <div className="font-medium text-gray-900 text-xs leading-tight">{member.name}</div>
                                                <div className="text-[10px] text-gray-500">{member.role}</div>
                                            </div>
                                        </td>
                                        {weekDays.map((day, index) => {
                                            const dateKey = day.toISOString().split('T')[0];
                                            const dayShifts = shifts[member.id]?.[dateKey] || [];

                                            return (
                                                <td key={index} className="px-1 py-1.5 text-center relative">
                                                    {dayShifts.length > 0 && (
                                                        <div className="flex flex-wrap gap-0.5 justify-center">
                                                            {dayShifts.map((shift, shiftIndex) => {
                                                                const shiftInfo = SHIFT_LEGENDS[shift];
                                                                const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;
                                                                const isPending = hasPendingSwap(member.id, dateKey, shift);
                                                                const isClickable = shift !== 'R' && shift !== 'D';

                                                                return (
                                                                    <div key={shiftIndex} className="relative inline-block">
                                                                        <div
                                                                            className={`${shiftInfo.color} px-2 py-1 rounded font-semibold text-xs transition-transform ${
                                                                                isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                                                            } ${isPending ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                                                                            onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                            onMouseLeave={() => setHoveredShift(null)}
                                                                            onClick={() => isClickable && handleShiftClick(member.id, dateKey, shift)}
                                                                        >
                                                                            {shift}
                                                                            {isPending && <span className="ml-1 text-yellow-600">⏳</span>}
                                                                        </div>
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
            )}

            {/* Month View - Calendar Grid */}
            {scheduleView === 'month' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-gray-700">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                        {getDaysInMonth().map((date, index) => {
                            const dateKey = date?.toISOString().split('T')[0];
                            const dayShifts = dateKey ? monthShifts[LOGGED_IN_USER_ID]?.[dateKey] || [] : [];
                            const today = isToday(date);

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[100px] border-b border-r border-gray-200 p-2 ${
                                        !date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                                    } ${today ? 'bg-blue-50' : ''} transition cursor-pointer`}
                                    onClick={() => date && setSelectedDate(date)}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-xs font-medium mb-1 ${
                                                today ? 'text-blue-600 font-bold' : 'text-gray-900'
                                            }`}>
                                                {date.getDate()}
                                                {today && (
                                                    <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Today</span>
                                                )}
                                            </div>

                                            {/* Shifts for the day */}
                                            <div className="space-y-1">
                                                {dayShifts.map((shift, idx) => {
                                                    const shiftInfo = SHIFT_LEGENDS[shift];
                                                    const isPending = dateKey ? hasPendingSwap(LOGGED_IN_USER_ID, dateKey, shift) : false;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`${shiftInfo.color} px-2 py-1 rounded text-[10px] font-medium flex items-center justify-between ${
                                                                isPending ? 'ring-1 ring-yellow-400' : ''
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${shiftInfo.dotColor}`}></div>
                                                                {shiftInfo.label}
                                                            </span>
                                                            {isPending && <span className="text-yellow-600">⏳</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
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

            {/* Day Detail Modal - Shown when clicking a date in month view */}
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
            {showSwapModal && swapFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Request Shift Swap
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowSwapModal(false);
                                        setSwapFormData(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Scenario 1: User's own shift - giving it away */}
                                {swapFormData.myDate && !swapFormData.targetUserId && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="text-sm font-medium text-blue-900 mb-2">Your Shift to Give</div>
                                            <div className="text-lg font-semibold text-blue-700">
                                                {new Date(swapFormData.myDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-sm text-blue-600">
                                                {SHIFT_LEGENDS[swapFormData.myShift].label} - {SHIFT_LEGENDS[swapFormData.myShift].time}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Team Member
                                            </label>
                                            <select
                                                value={swapFormData.targetUserId}
                                                onChange={(e) => setSwapFormData({
                                                    ...swapFormData,
                                                    targetUserId: e.target.value,
                                                    targetDate: '',
                                                })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Choose a team member...</option>
                                                {MOCK_TEAM_MEMBERS.filter(m => m.id !== LOGGED_IN_USER_ID).map(member => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name} ({member.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {swapFormData.targetUserId && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Their Shift to Take
                                                </label>
                                                <select
                                                    value={swapFormData.targetDate ? `${swapFormData.targetDate}-${swapFormData.targetShift}` : ''}
                                                    onChange={(e) => {
                                                        const [date, shift] = e.target.value.split('-');
                                                        setSwapFormData({
                                                            ...swapFormData,
                                                            targetDate: date,
                                                            targetShift: shift as 'M' | 'A' | 'N',
                                                        });
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Choose a shift...</option>
                                                    {getAvailableShifts(swapFormData.targetUserId).map((shift, idx) => (
                                                        <option key={idx} value={`${shift.date}-${shift.shiftType}`}>
                                                            {new Date(shift.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })} - {SHIFT_LEGENDS[shift.shiftType].label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Scenario 2: Someone else's shift - taking it */}
                                {swapFormData.targetUserId && swapFormData.targetDate && !swapFormData.myDate && (
                                    <>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="text-sm font-medium text-green-900 mb-2">Shift to Take</div>
                                            <div className="text-lg font-semibold text-green-700">
                                                {new Date(swapFormData.targetDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-sm text-green-600">
                                                {SHIFT_LEGENDS[swapFormData.targetShift].label} - {SHIFT_LEGENDS[swapFormData.targetShift].time}
                                            </div>
                                            <div className="text-sm text-green-800 mt-2">
                                                From: {MOCK_TEAM_MEMBERS.find(m => m.id === swapFormData.targetUserId)?.name}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Your Shift to Give
                                            </label>
                                            <select
                                                value={swapFormData.myDate ? `${swapFormData.myDate}-${swapFormData.myShift}` : ''}
                                                onChange={(e) => {
                                                    const [date, shift] = e.target.value.split('-');
                                                    setSwapFormData({
                                                        ...swapFormData,
                                                        myDate: date,
                                                        myShift: shift as 'M' | 'A' | 'N',
                                                    });
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Choose a shift...</option>
                                                {getAvailableShifts(LOGGED_IN_USER_ID).map((shift, idx) => (
                                                    <option key={idx} value={`${shift.date}-${shift.shiftType}`}>
                                                        {new Date(shift.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })} - {SHIFT_LEGENDS[shift.shiftType].label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Summary when both shifts are selected */}
                                {swapFormData.targetUserId && swapFormData.targetDate && swapFormData.myDate && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="text-sm font-medium text-gray-900 mb-3">Swap Summary</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">You give:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(swapFormData.myDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {swapFormData.myShift}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">You get:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(swapFormData.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {swapFormData.targetShift}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-300">
                                                <span className="text-gray-600">With: </span>
                                                <span className="font-medium text-gray-900">
                                                    {MOCK_TEAM_MEMBERS.find(m => m.id === swapFormData.targetUserId)?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowSwapModal(false);
                                        setSwapFormData(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSwapRequest}
                                    disabled={!swapFormData.targetUserId || !swapFormData.targetDate || !swapFormData.myDate}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Request Swap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScheduleTab;