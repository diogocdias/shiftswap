import { useState, useEffect } from 'react';
import CalendarView from "./components/CalendarView.tsx";
import {ShiftData, SwapFormData, SwapRequest, TeamMember} from "./Types.ts";
import TeamView from "./components/TeamView.tsx";
import {SHIFT_LEGENDS} from "./ShiftConstants.ts";
import SwapRequestModal from "./components/SwapRequestModal.tsx";
import GenerateScheduleModal from "./components/GenerateScheduleModal.tsx";
import {LoadingOverlay} from "../../components/LoadingOverlay.tsx";

// Hook to detect desktop screen size
function useIsDesktop() {
    const getCurrentState = () =>
        typeof window !== "undefined" ? window.innerWidth >= 1024 : false;

    const [isDesktop, setIsDesktop] = useState(getCurrentState);

    useEffect(() => {
        const update = () => {
            setIsDesktop(getCurrentState());
        };

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);

    return isDesktop;
}


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

// Generate shifts for entire month (for single user - calendar view)
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

// Generate shifts for entire month for all team members (for team view on desktop)
const generateTeamMonthShifts = (year: number, month: number): ShiftData => {
    const shifts: ShiftData = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shiftTypes: Array<'M' | 'A' | 'N' | 'R' | 'D'> = ['M', 'A', 'N', 'R', 'D'];

    MOCK_TEAM_MEMBERS.forEach(member => {
        shifts[member.id] = {};
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
            shifts[member.id][dateKey] = dayShifts;
        }
    });

    return shifts;
};

// Mock API function for generating team schedule
// Generates realistic schedules: working shifts (M, A, N), rest days (R), or days off (D)
// Rules:
// - Working shifts can be single or double (consecutive like M+A or A+N)
// - Rest and Day Off cannot be combined with working shifts
// - Each person gets roughly 2 rest/off days per week
const mockGenerateScheduleAPI = async (
    startDate: string,
    endDate: string,
    teamMembers: TeamMember[]
): Promise<ShiftData> => {
    // Simulate API delay of 200ms
    await new Promise(resolve => setTimeout(resolve, 200));

    const shifts: ShiftData = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Working shift types only (for combining)
    const workingShifts: Array<'M' | 'A' | 'N'> = ['M', 'A', 'N'];
    // Valid double shift combinations (consecutive shifts that make sense)
    const validDoubleShifts: Array<['M' | 'A' | 'N', 'M' | 'A' | 'N']> = [
        ['M', 'A'], // Morning + Afternoon (12 hours)
        ['A', 'N'], // Afternoon + Night (12 hours)
    ];

    teamMembers.forEach(member => {
        shifts[member.id] = {};
        let workingDaysInWeek = 0;
        let currentWeekStart: Date | null = null;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();

            // Track weeks to ensure ~2 rest/off days per week
            if (currentWeekStart === null || dayOfWeek === 1) {
                currentWeekStart = new Date(currentDate);
                workingDaysInWeek = 0;
            }

            // Determine if this should be a rest/off day
            // Higher chance on weekends, and ensure roughly 2 per week
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const needsRestDay = workingDaysInWeek >= 5;
            const restDayChance = isWeekend ? 0.6 : (needsRestDay ? 0.8 : 0.15);

            if (Math.random() < restDayChance) {
                // Assign rest day (R) or day off (D) - not combined with working shifts
                const restType: 'R' | 'D' = Math.random() > 0.5 ? 'R' : 'D';
                shifts[member.id][dateKey] = [restType];
            } else {
                workingDaysInWeek++;

                // Determine if single or double shift (15% chance for double shift)
                const isDoubleShift = Math.random() < 0.15;

                if (isDoubleShift) {
                    // Pick a valid double shift combination
                    const combo = validDoubleShifts[Math.floor(Math.random() * validDoubleShifts.length)];
                    shifts[member.id][dateKey] = [...combo];
                } else {
                    // Single working shift
                    const shift = workingShifts[Math.floor(Math.random() * workingShifts.length)];
                    shifts[member.id][dateKey] = [shift];
                }
            }
        }
    });

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
    const [teamMonth, setTeamMonth] = useState(new Date()); // Separate month state for team view
    const [shifts, setShifts] = useState<ShiftData>(() => generateMockShifts(currentWeekStart));
    const [teamMonthShifts, setTeamMonthShifts] = useState<ShiftData>(() =>
        generateTeamMonthShifts(new Date().getFullYear(), new Date().getMonth())
    );
    const [monthShifts, setMonthShifts] = useState<ShiftData>(() =>
        generateMonthShifts(new Date().getFullYear(), new Date().getMonth(), '1')
    );

    const [hoveredShift, setHoveredShift] = useState<string | null>(null);
    const [nameFilter, setNameFilter] = useState('');
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapFormData, setSwapFormData] = useState<SwapFormData | null>(null);
    const [pendingSwaps, setPendingSwaps] = useState<SwapRequest[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const LOGGED_IN_USER_ID = '1';
    const canGenerateSchedule = userRole === 'admin' || userRole === 'teamleader';

    // Detect desktop screen size
    const isDesktop = useIsDesktop();
    // Determine if team view should show month (desktop + admin/teamleader)
    const isTeamMonthView = isDesktop && (userRole === 'admin' || userRole === 'teamleader');

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

    // Navigate team month view (for desktop admin/teamleader)
    const navigateTeamMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(teamMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setTeamMonth(newDate);
        setTeamMonthShifts(generateTeamMonthShifts(newDate.getFullYear(), newDate.getMonth()));
    };

    // Calendar view functions
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
        setMonthShifts(generateMonthShifts(newDate.getFullYear(), newDate.getMonth(), LOGGED_IN_USER_ID));
    };

    // Combined navigation for team view (week or month based on view mode)
    const navigateTeamView = (direction: 'prev' | 'next') => {
        if (isTeamMonthView) {
            navigateTeamMonth(direction);
        } else {
            navigateWeek(direction);
        }
    };

    const goToToday = () => {
        const today = new Date();
        if (scheduleView === 'team') {
            if (isTeamMonthView) {
                setTeamMonth(new Date());
                setTeamMonthShifts(generateTeamMonthShifts(today.getFullYear(), today.getMonth()));
            } else {
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                const mondayDate = new Date(today.setDate(diff));
                setCurrentWeekStart(mondayDate);
                setShifts(generateMockShifts(mondayDate));
            }
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

    const getTeamMonthYear = () => {
        return teamMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Get the subtitle for the team view header (week range or month/year)
    const getTeamViewSubtitle = () => {
        if (isTeamMonthView) {
            return getTeamMonthYear();
        }
        return getWeekRange();
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
        const currentShifts = isTeamMonthView ? teamMonthShifts : shifts;
        const userShiftData = currentShifts[userId];

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

    const handleCloseModal = () => {
        setShowSwapModal(false);
        setSwapFormData(null);
    };

    const handleGenerateSchedule = async (startDate: string, endDate: string) => {
        setIsGenerating(true);
        try {
            const generatedShifts = await mockGenerateScheduleAPI(startDate, endDate, MOCK_TEAM_MEMBERS);

            // Merge the generated shifts with existing shifts
            const updateShifts = (prevShifts: ShiftData) => {
                const newShifts = { ...prevShifts };
                Object.entries(generatedShifts).forEach(([memberId, memberShifts]) => {
                    if (!newShifts[memberId]) {
                        newShifts[memberId] = {};
                    }
                    Object.entries(memberShifts).forEach(([date, shiftsData]) => {
                        newShifts[memberId][date] = shiftsData;
                    });
                });
                return newShifts;
            };

            // Update both week and month shifts to keep them in sync
            setShifts(updateShifts);
            setTeamMonthShifts(updateShifts);

            console.log('Schedule generated successfully:', { startDate, endDate, generatedShifts });
        } catch (error) {
            console.error('Failed to generate schedule:', error);
            alert('Failed to generate schedule. Please try again.');
        } finally {
            setIsGenerating(false);
        }
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
                                {scheduleView === 'team' ? getTeamViewSubtitle() : getMonthYear()}
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
                        {/* Generate Schedule Button - Only for admin/teamleader in team view */}
                        {scheduleView === 'team' && canGenerateSchedule && (
                            <button
                                onClick={() => setShowGenerateModal(true)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Generate Schedule
                            </button>
                        )}

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
                                onClick={() => scheduleView === 'team' ? navigateTeamView('prev') : navigateMonth('prev')}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title={`Previous ${isTeamMonthView ? 'month' : 'week'}`}
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
                                onClick={() => scheduleView === 'team' ? navigateTeamView('next') : navigateMonth('next')}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title={`Next ${isTeamMonthView ? 'month' : 'week'}`}
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
                    shifts={isTeamMonthView ? teamMonthShifts : shifts}
                    hoveredShift={hoveredShift}
                    setHoveredShift={setHoveredShift}
                    handleShiftClick={handleShiftClick}
                    hasPendingSwap={hasPendingSwap}
                    getDayName={getDayName}
                    formatDate={formatDate}
                    nameFilter={nameFilter}
                    userRole={userRole}
                    currentMonth={teamMonth}
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

            {/* Generate Schedule Modal */}
            <GenerateScheduleModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                onGenerate={handleGenerateSchedule}
            />

            {/* Loading Overlay - shown while generating schedule */}
            <LoadingOverlay
                isLoading={isGenerating}
                timeout={10000}
                onTimeout={() => {
                    setIsGenerating(false);
                    alert('Schedule generation timed out. Please try again.');
                }}
            />
        </div>
    );
}

export default ScheduleTab;