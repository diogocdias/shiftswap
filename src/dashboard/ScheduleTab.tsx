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

// Mock data - replace with actual API call
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'RN' },
    { id: '2', name: 'Mike Chen', role: 'RN' },
    { id: '3', name: 'Emily Davis', role: 'LPN' },
    { id: '4', name: 'James Wilson', role: 'RN' },
    { id: '5', name: 'Lisa Anderson', role: 'CNA' },
    { id: '6', name: 'Robert Taylor', role: 'RN' },
    { id: '7', name: 'Maria Garcia', role: 'LPN' },
];

// Mock shift data - replace with actual API call
const generateMockShifts = (startDate: Date): ShiftData => {
    const shifts: ShiftData = {};
    const shiftTypes: Array<'M' | 'A' | 'N' | 'R' | 'D'> = ['M', 'A', 'N', 'R', 'D'];

    MOCK_TEAM_MEMBERS.forEach(member => {
        shifts[member.id] = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];

            // Randomly assign 1-2 shifts per day, with some having double shifts
            const numShifts = Math.random() > 0.7 ? 2 : 1; // 30% chance of double shift
            const dayShifts: Array<'M' | 'A' | 'N' | 'R' | 'D'> = [];

            for (let j = 0; j < numShifts; j++) {
                let shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
                // Avoid duplicate shifts in the same day
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

const SHIFT_LEGENDS = {
    M: { label: 'Morning Shift', time: '6:00 AM - 2:00 PM', color: 'bg-yellow-100 text-yellow-800' },
    A: { label: 'Afternoon Shift', time: '2:00 PM - 10:00 PM', color: 'bg-orange-100 text-orange-800' },
    N: { label: 'Night Shift', time: '10:00 PM - 6:00 AM', color: 'bg-blue-100 text-blue-800' },
    R: { label: 'Rest Day', time: 'No work scheduled', color: 'bg-green-50 text-green-600 opacity-60' },
    D: { label: 'Day Off', time: 'Personal day off', color: 'bg-gray-50 text-gray-500 opacity-60' },
};

function ScheduleTab() {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(today.setDate(diff));
    });

    const [shifts, setShifts] = useState<ShiftData>(() => generateMockShifts(currentWeekStart));
    const [hoveredShift, setHoveredShift] = useState<string | null>(null);
    const [nameFilter, setNameFilter] = useState('');

    // Generate week days
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

    // Filter team members by name
    const filteredTeamMembers = MOCK_TEAM_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Team Schedule</h2>
                        <p className="text-sm text-gray-600 mt-1">{getWeekRange()}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Name Filter */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Filter by name..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {nameFilter && (
                                <button
                                    onClick={() => setNameFilter('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Previous week"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const day = today.getDay();
                                    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                                    const mondayDate = new Date(today.setDate(diff));
                                    setCurrentWeekStart(mondayDate);
                                    setShifts(generateMockShifts(mondayDate));
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => navigateWeek('next')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Next week"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Results Info */}
                {nameFilter && (
                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredTeamMembers.length} of {MOCK_TEAM_MEMBERS.length} team members
                    </div>
                )}
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                                Team Member
                            </th>
                            {weekDays.map((day, index) => (
                                <th key={index} className="px-4 py-4 text-center min-w-[100px]">
                                    <div className="text-sm font-semibold text-gray-900">{getDayName(day)}</div>
                                    <div className="text-xs text-gray-500 mt-1">{formatDate(day)}</div>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredTeamMembers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    No team members found matching "{nameFilter}"
                                </td>
                            </tr>
                        ) : (
                            filteredTeamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 sticky left-0 bg-white z-10">
                                        <div>
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.role}</div>
                                        </div>
                                    </td>
                                    {weekDays.map((day, index) => {
                                        const dateKey = day.toISOString().split('T')[0];
                                        const dayShifts = shifts[member.id]?.[dateKey] || [];

                                        return (
                                            <td key={index} className="px-4 py-4 text-center relative">
                                                {dayShifts.length > 0 && (
                                                    <div className="flex flex-col gap-1">
                                                        {dayShifts.map((shift, shiftIndex) => {
                                                            const shiftInfo = SHIFT_LEGENDS[shift];
                                                            const shiftKey = `${member.id}-${dateKey}-${shiftIndex}`;

                                                            return (
                                                                <div key={shiftIndex} className="relative inline-block">
                                                                    <div
                                                                        className={`${shiftInfo.color} px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-transform hover:scale-110`}
                                                                        onMouseEnter={() => setHoveredShift(shiftKey)}
                                                                        onMouseLeave={() => setHoveredShift(null)}
                                                                    >
                                                                        {shift}
                                                                    </div>
                                                                    {hoveredShift === shiftKey && (
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20 shadow-lg">
                                                                            <div className="font-semibold">{shiftInfo.label}</div>
                                                                            <div className="text-gray-300 mt-1">{shiftInfo.time}</div>
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

            {/* Legend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Shift Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(SHIFT_LEGENDS).map(([code, info]) => (
                        <div key={code} className="flex items-center gap-2">
                            <div className={`${info.color} w-8 h-8 rounded flex items-center justify-center font-semibold text-sm`}>
                                {code}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">{info.label}</div>
                                <div className="text-xs text-gray-500 truncate">{info.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ScheduleTab;