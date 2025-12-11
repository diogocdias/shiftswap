import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarView from "./components/CalendarView.tsx";
import { ShiftData, SwapFormData, SwapRequest, TeamMember } from "../../types/domain";
import TeamView from "./components/TeamView.tsx";
import { SHIFT_LEGENDS } from "./ShiftConstants.ts";
import SwapRequestModal from "./components/SwapRequestModal.tsx";
import GenerateScheduleModal from "./components/GenerateScheduleModal.tsx";
import CalendarSyncModal from "./components/CalendarSyncModal.tsx";
import { LoadingOverlay } from "../../components/LoadingOverlay.tsx";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useToast } from "../../context/ToastContext";
import { DEFAULTS } from "../../config/constants";
import { formatShortDate, getDayName, getMonthYear, getWeekStart, getWeekRange, getWeekDays, getMonthDays as getMonthDaysUtil, isToday as isTodayUtil } from "../../utils/dateUtils";
import { generateWeekShifts, generateMonthShiftsForUser, generateMonthShiftsForTeam, generateRealisticSchedule, mergeShifts } from "../../utils/shiftGenerator";
import { submitSwapRequest } from "../../services/api/scheduleService";
import { exportScheduleToPDF } from "../../utils/pdfExport";
import { getTimeOffForDate, subscribeToTimeOff } from "../../services/timeOffService";


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

interface ScheduleTabProps {
    userRole: string;
}

function ScheduleTab({userRole}: ScheduleTabProps) {
    const { t } = useTranslation();
    const { showSuccess, showWarning, showError } = useToast();
    const [scheduleView, setScheduleView] = useState<'team' | 'calendar'>('team');
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [teamMonth, setTeamMonth] = useState(new Date()); // Separate month state for team view
    const [shifts, setShifts] = useState<ShiftData>(() => generateWeekShifts(getWeekStart(new Date()), MOCK_TEAM_MEMBERS));
    const [teamMonthShifts, setTeamMonthShifts] = useState<ShiftData>(() =>
        generateMonthShiftsForTeam(new Date().getFullYear(), new Date().getMonth(), MOCK_TEAM_MEMBERS)
    );
    const [monthShifts, setMonthShifts] = useState<ShiftData>(() =>
        generateMonthShiftsForUser(new Date().getFullYear(), new Date().getMonth(), DEFAULTS.LOGGED_IN_USER_ID)
    );

    const [hoveredShift, setHoveredShift] = useState<string | null>(null);
    const [nameFilter, setNameFilter] = useState('');
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapFormData, setSwapFormData] = useState<SwapFormData | null>(null);
    const [pendingSwaps, setPendingSwaps] = useState<SwapRequest[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTableExpanded, setIsTableExpanded] = useState(false);
    const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);

    // Multi-shift selection state
    const [selectedShifts, setSelectedShifts] = useState<Array<{
        userId: string;
        date: string;
        shiftType: 'M' | 'A' | 'N';
    }>>([]);

    // Time-off records state (subscribe to changes from VacationTab)
    const [, setTimeOffVersion] = useState(0);

    // Subscribe to time-off changes to trigger re-renders
    useEffect(() => {
        const unsubscribe = subscribeToTimeOff(() => {
            setTimeOffVersion(v => v + 1);
        });
        return unsubscribe;
    }, []);

    const LOGGED_IN_USER_ID = DEFAULTS.LOGGED_IN_USER_ID;
    const canGenerateSchedule = userRole === 'admin' || userRole === 'teamleader';

    // Detect desktop screen size
    const isDesktop = useIsDesktop();
    // Determine if team view should show month (desktop) or week (mobile)
    const isTeamMonthView = isDesktop;

    // Team view functions
    const weekDays = getWeekDays(currentWeekStart);

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeekStart(newDate);
        setShifts(generateWeekShifts(newDate, MOCK_TEAM_MEMBERS));
    };

    // Navigate team month view (for desktop admin/teamleader)
    const navigateTeamMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(teamMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setTeamMonth(newDate);
        setTeamMonthShifts(generateMonthShiftsForTeam(newDate.getFullYear(), newDate.getMonth(), MOCK_TEAM_MEMBERS));
    };

    // Calendar view functions
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
        setMonthShifts(generateMonthShiftsForUser(newDate.getFullYear(), newDate.getMonth(), LOGGED_IN_USER_ID));
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
                setTeamMonthShifts(generateMonthShiftsForTeam(today.getFullYear(), today.getMonth(), MOCK_TEAM_MEMBERS));
            } else {
                const mondayDate = getWeekStart(today);
                setCurrentWeekStart(mondayDate);
                setShifts(generateWeekShifts(mondayDate, MOCK_TEAM_MEMBERS));
            }
        } else {
            setCurrentMonth(new Date());
            setMonthShifts(generateMonthShiftsForUser(today.getFullYear(), today.getMonth(), LOGGED_IN_USER_ID));
        }
    };

    // Use imported date utilities but wrap for local usage
    const getDaysInMonth = () => getMonthDaysUtil(currentMonth.getFullYear(), currentMonth.getMonth());
    const isToday = (date: Date | null) => isTodayUtil(date);
    const formatDate = (date: Date) => formatShortDate(date);
    const getLocalDayName = (date: Date) => getDayName(date);
    const getLocalWeekRange = () => getWeekRange(currentWeekStart);
    const getLocalMonthYear = () => getMonthYear(currentMonth);
    const getTeamMonthYear = () => getMonthYear(teamMonth);

    // Get the subtitle for the team view header (week range or month/year)
    const getTeamViewSubtitle = () => {
        if (isTeamMonthView) {
            return getTeamMonthYear();
        }
        return getLocalWeekRange();
    };

    const filteredTeamMembers = MOCK_TEAM_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    // Toggle shift selection for multi-shift swap
    const handleShiftClick = (userId: string, date: string, shiftType: 'M' | 'A' | 'N' | 'R' | 'D') => {
        if (shiftType === 'R' || shiftType === 'D') return;

        const workingShiftType = shiftType as 'M' | 'A' | 'N';

        setSelectedShifts(prev => {
            const existingIndex = prev.findIndex(
                s => s.userId === userId && s.date === date && s.shiftType === workingShiftType
            );

            if (existingIndex >= 0) {
                // Deselect the shift
                return prev.filter((_, i) => i !== existingIndex);
            } else {
                // Select the shift
                return [...prev, { userId, date, shiftType: workingShiftType }];
            }
        });
    };

    // Check if a shift is currently selected
    const isShiftSelected = (userId: string, date: string, shiftType: 'M' | 'A' | 'N' | 'R' | 'D') => {
        if (shiftType === 'R' || shiftType === 'D') return false;
        return selectedShifts.some(
            s => s.userId === userId && s.date === date && s.shiftType === shiftType
        );
    };

    // Open the swap request modal with all selected shifts
    const handleOpenSwapModal = () => {
        if (selectedShifts.length === 0) return;

        // Separate shifts into my shifts and target shifts
        const myShifts = selectedShifts
            .filter(s => s.userId === LOGGED_IN_USER_ID)
            .map(s => ({ date: s.date, shiftType: s.shiftType }));

        const targetShifts = selectedShifts
            .filter(s => s.userId !== LOGGED_IN_USER_ID)
            .map(s => ({ date: s.date, shiftType: s.shiftType }));

        // Determine target user (use the first non-logged-in user's shifts)
        const targetUserShift = selectedShifts.find(s => s.userId !== LOGGED_IN_USER_ID);
        const targetUserId = targetUserShift?.userId || '';

        setSwapFormData({
            targetUserId,
            targetDate: targetShifts[0]?.date || '',
            targetShift: targetShifts[0]?.shiftType || 'M',
            myDate: myShifts[0]?.date || '',
            myShift: myShifts[0]?.shiftType || 'M',
            myShifts,
            targetShifts,
        });
        setShowSwapModal(true);
    };

    // Clear selected shifts
    const clearSelectedShifts = () => {
        setSelectedShifts([]);
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

        if (!swapFormData.targetUserId || !swapFormData.targetShifts || swapFormData.targetShifts.length === 0 || !swapFormData.myShifts || swapFormData.myShifts.length === 0) {
            showWarning(t('schedule.toast.fillAllFields'));
            return;
        }

        // Use the centralized schedule service to submit the request
        const newRequests = await submitSwapRequest(swapFormData, LOGGED_IN_USER_ID);

        setPendingSwaps(prev => [...prev, ...newRequests]);
        setShowSwapModal(false);
        setSwapFormData(null);
        // Clear selected shifts on successful submission
        clearSelectedShifts();

        const myShiftsCount = swapFormData.myShifts.length;
        const targetShiftsCount = swapFormData.targetShifts.length;

        showSuccess(
            myShiftsCount === 1 && targetShiftsCount === 1
                ? t('schedule.toast.swapSubmitted', { myShifts: myShiftsCount, targetShifts: targetShiftsCount })
                : t('schedule.toast.swapSubmittedPlural', { myShifts: myShiftsCount, targetShifts: targetShiftsCount })
        );
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
        // Note: We intentionally do NOT clear selectedShifts here
        // so the user can cancel and re-open without losing their selections
    };

    const handleGenerateSchedule = async (startDate: string, endDate: string) => {
        setIsGenerating(true);
        try {
            const generatedShifts = generateRealisticSchedule(startDate, endDate, MOCK_TEAM_MEMBERS);

            // Merge the generated shifts with existing shifts using the utility function
            const updateShifts = (prevShifts: ShiftData) => mergeShifts(prevShifts, generatedShifts);

            // Update both week and month shifts to keep them in sync
            setShifts(updateShifts);
            setTeamMonthShifts(updateShifts);

            console.log('Schedule generated successfully:', { startDate, endDate, generatedShifts });
        } catch (error) {
            console.error('Failed to generate schedule:', error);
            showError(t('schedule.toast.generateFailed'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = () => {
        // Always export the full month, using teamMonth for the current month context
        const exportMonth = scheduleView === 'team' ? teamMonth : currentMonth;
        const year = exportMonth.getFullYear();
        const month = exportMonth.getMonth();

        // Generate fresh month shifts for all team members to ensure complete data
        const fullMonthShifts = generateMonthShiftsForTeam(year, month, MOCK_TEAM_MEMBERS);

        // Merge with existing shifts to preserve any generated/modified shifts
        const exportShifts = mergeShifts(fullMonthShifts, teamMonthShifts);

        exportScheduleToPDF({
            year,
            month,
            shifts: exportShifts,
            teamMembers: MOCK_TEAM_MEMBERS,
        });
    };

    const handleCalendarSync = (providerId: string) => {
        // TODO: Integrate with real calendar API
        console.log('Calendar synced with provider:', providerId);
        showSuccess(t('schedule.toast.calendarSynced'));
    };

    return (
        <div className={`space-y-4 ${isTableExpanded && scheduleView === 'team' ? 'fixed inset-0 z-40 bg-gray-100 p-4 overflow-auto' : ''}`}>
            {/* Header with View Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {scheduleView === 'team' ? t('schedule.teamSchedule') : t('schedule.myCalendar')}
                            </h2>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {scheduleView === 'team' ? getTeamViewSubtitle() : getLocalMonthYear()}
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
                                {t('schedule.teamSchedule')}
                            </button>
                            <button
                                onClick={() => setScheduleView('calendar')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                                    scheduleView === 'calendar'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {t('schedule.myCalendar')}
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
                                {t('schedule.generateSchedule')}
                            </button>
                        )}

                        {/* Export PDF Button - Available in team view */}
                        {scheduleView === 'team' && (
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs"
                                title={t('schedule.exportPDF')}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {t('schedule.exportPDF')}
                            </button>
                        )}

                        {/* Sync Calendar Button - Available in calendar view */}
                        {scheduleView === 'calendar' && (
                            <button
                                onClick={() => setShowCalendarSyncModal(true)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs"
                                title={t('schedule.syncCalendar')}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('schedule.syncCalendar')}
                            </button>
                        )}

                        {/* Name Filter - Only show in team view */}
                        {scheduleView === 'team' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('schedule.filterByName')}
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
                                title={isTeamMonthView ? t('schedule.previousMonth') : t('schedule.previousWeek')}
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
                                title={isTeamMonthView ? t('schedule.nextMonth') : t('schedule.nextWeek')}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Expand/Collapse Button - Only on desktop for team view */}
                        {scheduleView === 'team' && isDesktop && (
                            <button
                                onClick={() => setIsTableExpanded(!isTableExpanded)}
                                className="hidden md:flex items-center justify-center p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title={isTableExpanded ? t('schedule.collapseTable') : t('schedule.expandTable')}
                            >
                                {isTableExpanded ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {scheduleView === 'team' && nameFilter && (
                    <div className="mt-2 text-xs text-gray-600">
                        {t('schedule.showingMembers', { shown: filteredTeamMembers.length, total: MOCK_TEAM_MEMBERS.length })}
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
                    isShiftSelected={isShiftSelected}
                    getDayName={getLocalDayName}
                    formatDate={formatDate}
                    nameFilter={nameFilter}
                    currentMonth={teamMonth}
                    isExpanded={isTableExpanded}
                    getTimeOffForDate={getTimeOffForDate}
                />
            )}

            {/* Floating Request Swap Button - appears when shifts are selected */}
            {selectedShifts.length > 0 && scheduleView === 'team' && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">{selectedShifts.length}</span>
                            {' '}{selectedShifts.length === 1 ? t('schedule.shiftsSelected', { count: selectedShifts.length }) : t('schedule.shiftsSelectedPlural', { count: selectedShifts.length })}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearSelectedShifts}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                {t('schedule.clear')}
                            </button>
                            <button
                                onClick={handleOpenSwapModal}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                {t('schedule.requestSwap')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar View - Calendar Grid */}
            {scheduleView === 'calendar' && (
                <CalendarView
                    getDaysInMonth={getDaysInMonth}
                    monthShifts={monthShifts}
                    LOGGED_IN_USER_ID={LOGGED_IN_USER_ID}
                    isToday={isToday}
                    setSelectedDate={setSelectedDate}
                    getTimeOffForDate={getTimeOffForDate}
                />
            )}

            {/* Legend */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">{t('schedule.shiftLegend')}</h3>
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
                                                <div className="text-gray-500">{t('schedule.noShiftsScheduled')}</div>
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
                                                            <span>⏳</span> {t('schedule.dayDetail.swapPending')}
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
                                                        {t('schedule.requestSwap')}
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
                                {t('common.close')}
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

            {/* Calendar Sync Modal */}
            <CalendarSyncModal
                isOpen={showCalendarSyncModal}
                onClose={() => setShowCalendarSyncModal(false)}
                onSync={handleCalendarSync}
            />

            {/* Loading Overlay - shown while generating schedule */}
            <LoadingOverlay
                isLoading={isGenerating}
                timeout={10000}
                onTimeout={() => {
                    setIsGenerating(false);
                    showError(t('schedule.toast.generateTimeout'));
                }}
            />
        </div>
    );
}

export default ScheduleTab;