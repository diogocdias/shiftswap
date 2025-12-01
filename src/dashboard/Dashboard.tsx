import { useState, useEffect } from 'react';
import ScheduleTab from './ScheduleTab';

interface DashboardProps {
    navigate: (page: string) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: string;
    badge?: number;
    order: number;
}

// TODO: REMOVE THIS MOCK API WHEN BACKEND CMS IS READY
// This simulates the CMS API response for menu items based on user role
const mockFetchMenuItems = async (sessionId: string): Promise<MenuItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock: Extract role from session (in real implementation, backend validates session)
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userRole = userData?.role || 'user';

    // Mock CMS responses for different roles
    const menuItemsByRole: Record<string, MenuItem[]> = {
        user: [
            { id: 'overview', label: 'Overview', icon: '🏠', order: 1 },
            { id: 'schedule', label: 'My Schedule', icon: '📅', order: 2 },
            { id: 'requests', label: 'Requests', icon: '🔄', badge: 2, order: 3 },
        ],
        teamleader: [
            { id: 'overview', label: 'Overview', icon: '🏠', order: 1 },
            { id: 'schedule', label: 'Schedule', icon: '📅', order: 2 },
            { id: 'team', label: 'Team', icon: '👥', order: 3 },
            { id: 'requests', label: 'Requests', icon: '🔄', badge: 2, order: 4 },
            { id: 'analytics', label: 'Analytics', icon: '📊', order: 5 },
        ],
        admin: [
            { id: 'overview', label: 'Overview', icon: '🏠', order: 1 },
            { id: 'schedule', label: 'All Schedules', icon: '📅', order: 2 },
            { id: 'team', label: 'All Staff', icon: '👥', order: 3 },
            { id: 'requests', label: 'All Requests', icon: '🔄', badge: 2, order: 4 },
            { id: 'analytics', label: 'Analytics', icon: '📊', order: 5 },
            { id: 'settings', label: 'Settings', icon: '⚙️', order: 6 },
        ],
    };

    return menuItemsByRole[userRole] || menuItemsByRole.user;
};
// END TODO

function Dashboard({ navigate }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    // Get mock user data from sessionStorage
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userName = userData?.name || 'User';
    const userRole = userData?.role || 'user';

    // Fetch menu items from CMS API on component mount
    useEffect(() => {
        const loadMenuItems = async () => {
            setIsLoadingMenu(true);
            try {
                // TODO: REPLACE WITH ACTUAL CMS API CALL
                // const response = await fetch('/api/cms/menu', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ sessionId: userData?.sessionId })
                // });
                // const items = await response.json();

                const items = await mockFetchMenuItems(userData?.sessionId || '');
                // END TODO

                setMenuItems(items.sort((a, b) => a.order - b.order));
            } catch (error) {
                console.error('Failed to load menu items:', error);
                // Fallback to basic menu if CMS fails
                setMenuItems([
                    { id: 'overview', label: 'Overview', icon: '🏠', order: 1 },
                ]);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        loadMenuItems();
    }, [userData?.sessionId]);

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
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <aside className="w-14 md:w-20 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="h-10 md:h-16  md:py-3 flex items-center justify-center border-b border-gray-200">
                    <img
                        src="/shiftswap_logo.png"
                        alt="ShiftSwap"
                        className="h-8 w-8 md:h-10 md:w-10"
                    />
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-6">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full h-14 md:h-16 flex flex-col items-center justify-center gap-1 relative transition ${
                                activeTab === item.id
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            title={item.label}
                        >
                            <span className="text-xl md:text-2xl">{item.icon}</span>
                            <span className="text-xs font-medium hidden md:block">{item.label.split(' ')[0]}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-200 p-2 md:p-4">
                    <div className="relative group">
                        <button className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-base md:text-lg hover:bg-blue-700 transition">
                            {userName.charAt(0)}
                        </button>
                        {/* Tooltip - positioned to prevent gap */}
                        <div className="absolute left-full bottom-0 ml-1 hidden group-hover:block bg-gray-900 text-white text-sm py-3 px-4 rounded whitespace-nowrap before:content-[''] before:absolute before:right-full before:top-0 before:bottom-0 before:w-2 before:bg-transparent">
                            <div className="font-medium mb-1">{userName}</div>
                            <div className="text-xs text-gray-300 capitalize mb-2">{userRole}</div>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-300 hover:text-red-200 bg-red-900/30 px-3 py-1 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="h-10 md:h-16 px-3 md:px-8 py-3 md:py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                                {menuItems.find(item => item.id === activeTab)?.label}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-3 md:p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Welcome Message */}
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    Welcome back, {userName.split(' ')[0]}! 👋
                                </h2>
                                <p className="text-sm md:text-base text-gray-600">Here's what's happening today</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                                <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600 text-xs md:text-sm">Upcoming Shifts</span>
                                        <span className="text-xl md:text-2xl">📅</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{upcomingShifts.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">This week</div>
                                </div>

                                <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600 text-xs md:text-sm">Swap Requests</span>
                                        <span className="text-xl md:text-2xl">🔄</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{swapRequests.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">Pending approval</div>
                                </div>

                                <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600 text-xs md:text-sm">Hours This Week</span>
                                        <span className="text-xl md:text-2xl">⏱️</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">32</div>
                                    <div className="text-xs text-gray-500 mt-1">8 hours remaining</div>
                                </div>

                                <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600 text-xs md:text-sm">Team Members</span>
                                        <span className="text-xl md:text-2xl">👥</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{teamMembers.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {teamMembers.filter(m => m.status === 'on-shift').length} on shift now
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions & Next Shift */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <button className="text-left px-3 md:px-4 py-2 md:py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-2 md:gap-3">
                                                <span className="text-lg md:text-xl">🔄</span>
                                                <span className="font-medium text-sm md:text-base">Request Swap</span>
                                            </button>
                                            <button className="text-left px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 md:gap-3">
                                                <span className="text-lg md:text-xl">📅</span>
                                                <span className="font-medium text-sm md:text-base">View Schedule</span>
                                            </button>
                                            <button className="text-left px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 md:gap-3">
                                                <span className="text-lg md:text-xl">📝</span>
                                                <span className="font-medium text-sm md:text-base">Time Off</span>
                                            </button>
                                            <button className="text-left px-3 md:px-4 py-2 md:py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 md:gap-3">
                                                <span className="text-lg md:text-xl">👥</span>
                                                <span className="font-medium text-sm md:text-base">Team Chat</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 md:p-6 text-white">
                                    <div className="text-xs md:text-sm opacity-90 mb-2">Next Shift</div>
                                    <div className="text-xl md:text-2xl font-bold mb-1">Monday, Dec 2</div>
                                    <div className="text-xs md:text-sm opacity-90 mb-4">8:00 AM - 4:00 PM</div>
                                    <div className="flex items-center gap-2 text-xs md:text-sm">
                                        <span>📍</span>
                                        <span>Ward A</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && <ScheduleTab />}

                    {/* Team Tab */}
                    {activeTab === 'team' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {userRole === 'admin' ? 'All Staff Members' : 'Team Members'}
                                </h2>
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {userRole === 'admin' ? 'All Swap Requests' : 'Swap Requests'}
                                </h2>
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

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2">Total Hours This Month</div>
                                    <div className="text-3xl font-bold text-gray-900">328</div>
                                    <div className="text-xs text-green-600 mt-2">↑ 12% from last month</div>
                                </div>
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2">Shift Swaps</div>
                                    <div className="text-3xl font-bold text-gray-900">24</div>
                                    <div className="text-xs text-blue-600 mt-2">18 approved, 6 pending</div>
                                </div>
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2">Coverage Rate</div>
                                    <div className="text-3xl font-bold text-gray-900">98%</div>
                                    <div className="text-xs text-green-600 mt-2">Excellent coverage</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Shift Distribution</h3>
                                <p className="text-gray-500">Analytics charts will be displayed here</p>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Facility Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Facility Name</label>
                                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Memorial Hospital" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Time Zone</label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                                <option>Eastern Time (ET)</option>
                                                <option>Pacific Time (PT)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;