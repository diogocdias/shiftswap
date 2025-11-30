import { useState } from 'react';

interface DashboardProps {
    navigate: (page: string) => void;
}

function Dashboard({ navigate }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('schedule');

    // Get mock user data from sessionStorage
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userName = userData?.name || 'User';
    const userRole = userData?.role || 'user';

    const handleLogout = () => {
        sessionStorage.removeItem('mockUser');
        navigate('home');
    };

    // Mock data for demonstration
    const upcomingShifts = [
        { id: 1, date: 'Dec 2', day: 'Mon', time: '8:00 AM - 4:00 PM', type: 'Day Shift', location: 'Ward A' },
        { id: 2, date: 'Dec 4', day: 'Wed', time: '8:00 AM - 4:00 PM', type: 'Day Shift', location: 'ER' },
        { id: 3, date: 'Dec 6', day: 'Fri', time: '8:00 PM - 6:00 AM', type: 'Night Shift', location: 'ICU' },
    ];

    const swapRequests = [
        { id: 1, from: 'Sarah Johnson', shift: 'Dec 3, 2:00 PM - 10:00 PM', status: 'pending' },
        { id: 2, from: 'Mike Chen', shift: 'Dec 8, 8:00 AM - 4:00 PM', status: 'pending' },
    ];

    const teamMembers = [
        { id: 1, name: 'Sarah Johnson', role: 'RN', status: 'on-shift', shift: 'Day' },
        { id: 2, name: 'Mike Chen', role: 'RN', status: 'off', shift: '-' },
        { id: 3, name: 'Emily Davis', role: 'LPN', status: 'on-shift', shift: 'Night' },
        { id: 4, name: 'James Wilson', role: 'RN', status: 'on-shift', shift: 'Day' },
        { id: 5, name: 'Lisa Anderson', role: 'CNA', status: 'off', shift: '-' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <img
                                src="/shiftswap_side.png"
                                alt="ShiftSwap"
                                className="h-8 w-auto"
                            />
                            <div className="hidden md:flex items-center gap-6">
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`text-sm font-medium transition ${
                                        activeTab === 'schedule'
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Schedule
                                </button>
                                <button
                                    onClick={() => setActiveTab('team')}
                                    className={`text-sm font-medium transition ${
                                        activeTab === 'team'
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Team
                                </button>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`text-sm font-medium transition ${
                                        activeTab === 'requests'
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Requests
                                    {swapRequests.length > 0 && (
                                        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            {swapRequests.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                                    <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                                </div>
                                <div className="relative">
                                    <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                                        {userName.charAt(0)}
                                    </button>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {userName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">Upcoming Shifts</span>
                            <span className="text-2xl">📅</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{upcomingShifts.length}</div>
                        <div className="text-xs text-gray-500 mt-1">This week</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">Swap Requests</span>
                            <span className="text-2xl">🔄</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{swapRequests.length}</div>
                        <div className="text-xs text-gray-500 mt-1">Pending approval</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">Hours This Week</span>
                            <span className="text-2xl">⏱️</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">32</div>
                        <div className="text-xs text-gray-500 mt-1">8 hours remaining</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">Team Members</span>
                            <span className="text-2xl">👥</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {teamMembers.filter(m => m.status === 'on-shift').length} on shift now
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Schedule/Calendar */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'schedule' && (
                            <>
                                {/* Upcoming Shifts */}
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Your Upcoming Shifts</h2>
                                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                View All
                                            </button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {upcomingShifts.map((shift) => (
                                            <div key={shift.id} className="p-6 hover:bg-gray-50 transition">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-gray-900">{shift.date.split(' ')[1]}</div>
                                                            <div className="text-xs text-gray-500 uppercase">{shift.date.split(' ')[0]}</div>
                                                            <div className="text-xs text-gray-500">{shift.day}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{shift.type}</div>
                                                            <div className="text-sm text-gray-600">{shift.time}</div>
                                                            <div className="text-sm text-gray-500">{shift.location}</div>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                        Request Swap
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekly Calendar View */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week</h2>
                                    <div className="grid grid-cols-7 gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                            <div key={day} className="text-center">
                                                <div className="text-xs text-gray-500 mb-2">{day}</div>
                                                <div className={`aspect-square rounded-lg p-2 text-sm ${
                                                    i === 0 || i === 2 || i === 4
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                    <div className="font-medium">{2 + i}</div>
                                                    {(i === 0 || i === 2 || i === 4) && (
                                                        <div className="text-xs mt-1 opacity-90">
                                                            {i === 4 ? 'Night' : 'Day'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'team' && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="p-6 hover:bg-gray-50 transition">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700">
                                                        {member.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{member.name}</div>
                                                        <div className="text-sm text-gray-500">{member.role}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        member.status === 'on-shift'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {member.status === 'on-shift' ? `On ${member.shift} Shift` : 'Off Duty'}
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">Swap Requests</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {swapRequests.map((request) => (
                                        <div key={request.id} className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700">
                                                        {request.from.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{request.from}</div>
                                                        <div className="text-sm text-gray-600">wants to swap shifts</div>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <div className="text-sm text-gray-600 mb-1">Shift Details</div>
                                                <div className="font-medium text-gray-900">{request.shift}</div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                                                    Approve
                                                </button>
                                                <button className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium">
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-3">
                                    <span className="text-xl">🔄</span>
                                    <span className="font-medium">Request Shift Swap</span>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-3">
                                    <span className="text-xl">📅</span>
                                    <span className="font-medium">View Full Schedule</span>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-3">
                                    <span className="text-xl">📝</span>
                                    <span className="font-medium">Request Time Off</span>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div>
                                        <div className="text-sm text-gray-900">Shift confirmed</div>
                                        <div className="text-xs text-gray-500">Dec 2, Day Shift</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    <div>
                                        <div className="text-sm text-gray-900">Swap approved</div>
                                        <div className="text-xs text-gray-500">Nov 28 swap with John</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                                    <div>
                                        <div className="text-sm text-gray-900">New schedule posted</div>
                                        <div className="text-xs text-gray-500">Week of Dec 9</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Shift Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                            <div className="text-sm opacity-90 mb-2">Next Shift</div>
                            <div className="text-2xl font-bold mb-1">Monday, Dec 2</div>
                            <div className="text-sm opacity-90 mb-4">8:00 AM - 4:00 PM</div>
                            <div className="flex items-center gap-2 text-sm">
                                <span>📍</span>
                                <span>Ward A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;