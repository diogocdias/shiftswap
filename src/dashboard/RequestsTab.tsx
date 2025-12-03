import { useState } from 'react';

interface SwapRequest {
    id: number;
    from: string;
    fromId: string;
    to: string;
    toId: string;
    fromShift: {
        date: string;
        time: string;
        type: string;
    };
    toShift: {
        date: string;
        time: string;
        type: string;
    };
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
}

// Mock data - replace with actual API call
const MOCK_SWAP_REQUESTS: SwapRequest[] = [
    {
        id: 1,
        from: 'Sarah Johnson',
        fromId: '1',
        to: 'Mike Chen',
        toId: '2',
        fromShift: {
            date: 'Dec 3',
            time: '2:00 PM - 10:00 PM',
            type: 'Afternoon Shift'
        },
        toShift: {
            date: 'Dec 5',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        status: 'pending',
        createdAt: '2024-12-01T10:30:00Z'
    },
    {
        id: 2,
        from: 'Emily Davis',
        fromId: '3',
        to: 'Sarah Johnson',
        toId: '1',
        fromShift: {
            date: 'Dec 8',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        toShift: {
            date: 'Dec 10',
            time: '10:00 PM - 6:00 AM',
            type: 'Night Shift'
        },
        status: 'pending',
        createdAt: '2024-12-02T14:15:00Z'
    },
    {
        id: 3,
        from: 'Sarah Johnson',
        fromId: '1',
        to: 'James Wilson',
        toId: '4',
        fromShift: {
            date: 'Dec 12',
            time: '10:00 PM - 6:00 AM',
            type: 'Night Shift'
        },
        toShift: {
            date: 'Dec 14',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        status: 'approved',
        createdAt: '2024-11-30T09:00:00Z'
    },
];

function RequestsTab() {
    const [requests, setRequests] = useState<SwapRequest[]>(MOCK_SWAP_REQUESTS);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

    // Mock logged-in user ID - in production, get from auth context
    const LOGGED_IN_USER_ID = '1';

    // Get user role from session storage
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userRole = userData?.role || 'user';

    const handleApprove = async (requestId: number) => {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/swap-requests/${requestId}/approve`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' }
        // });
        // const result = await response.json();

        // Mock API response
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Approving request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'approved' as const } : req
        ));

        alert('Swap request approved successfully!');
    };

    const handleDecline = async (requestId: number) => {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/swap-requests/${requestId}/decline`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' }
        // });
        // const result = await response.json();

        // Mock API response
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Declining request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'declined' as const } : req
        ));

        alert('Swap request declined.');
    };

    const handleShare = (request: SwapRequest) => {
        const shareText = `🔄 Shift Swap Request\n\n` +
            `From: ${request.from}\n` +
            `To: ${request.to}\n\n` +
            `Giving: ${request.fromShift.date} - ${request.fromShift.type} (${request.fromShift.time})\n` +
            `Taking: ${request.toShift.date} - ${request.toShift.type} (${request.toShift.time})\n\n` +
            `Status: ${request.status.toUpperCase()}\n\n` +
            `Can you help cover this shift?`;

        const encodedText = encodeURIComponent(shareText);

        // Use native share if available (mobile devices)
        if (navigator.share) {
            navigator.share({
                title: 'Shift Swap Request',
                text: shareText
            }).catch(err => console.log('Share cancelled', err));
        } else {
            // Fallback to WhatsApp Web
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
    };

    // Filter requests based on selected filter
    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    // For regular users, separate into two categories
    const incomingRequests = filteredRequests.filter(req => req.toId === LOGGED_IN_USER_ID);
    const outgoingRequests = filteredRequests.filter(req => req.fromId === LOGGED_IN_USER_ID);

    // For admins/team leaders, show all requests
    const displayRequests = userRole === 'admin' || userRole === 'teamleader'
        ? filteredRequests
        : null;

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Render a single request card
    const renderRequestCard = (request: SwapRequest, showActions: boolean) => (
        <div key={request.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-medium text-blue-700">
                        {request.from.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{request.from}</div>
                        <div className="text-sm text-gray-600">
                            wants to swap shifts with <span className="font-medium text-gray-900">{request.to}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                    </span>
                    {request.status === 'pending' && (
                        <button
                            onClick={() => handleShare(request)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Share this swap request"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Shift Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-red-900 mb-2 flex items-center gap-1">
                        <span>←</span> {request.from} gives
                    </div>
                    <div className="font-semibold text-red-700">{request.fromShift.date}</div>
                    <div className="text-sm text-red-600">{request.fromShift.type}</div>
                    <div className="text-xs text-red-500 mt-1">{request.fromShift.time}</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-green-900 mb-2 flex items-center gap-1">
                        <span>→</span> {request.to} takes
                    </div>
                    <div className="font-semibold text-green-700">{request.toShift.date}</div>
                    <div className="text-sm text-green-600">{request.toShift.type}</div>
                    <div className="text-xs text-green-500 mt-1">{request.toShift.time}</div>
                </div>
            </div>

            {/* Action Buttons - Only show for pending requests that user can manage */}
            {request.status === 'pending' && showActions && (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleDecline(request.id)}
                        className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
                    >
                        Decline
                    </button>
                </div>
            )}

            {/* Status message for non-actionable requests */}
            {request.status === 'pending' && !showActions && (
                <div className="text-sm text-gray-600 italic">
                    Waiting for {request.to}'s approval
                </div>
            )}

            {request.status === 'approved' && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    This swap has been approved
                </div>
            )}

            {request.status === 'declined' && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    This swap has been declined
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Header with Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {userRole === 'admin' || userRole === 'teamleader' ? 'All Swap Requests' : 'Swap Requests'}
                        </h2>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {userRole === 'user'
                                ? `${incomingRequests.length} incoming, ${outgoingRequests.length} outgoing`
                                : `${displayRequests?.length || 0} ${displayRequests?.length === 1 ? 'request' : 'requests'}`
                            }
                        </p>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Filter:</span>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${
                                    filter === 'all'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${
                                    filter === 'pending'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${
                                    filter === 'approved'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilter('declined')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${
                                    filter === 'declined'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Declined
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin/Team Leader View - All Requests */}
            {(userRole === 'admin' || userRole === 'teamleader') && (
                <div className="bg-white rounded-lg border border-gray-200">
                    {displayRequests && displayRequests.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-3">📋</div>
                            <div className="text-gray-900 font-medium mb-1">No requests found</div>
                            <div className="text-sm text-gray-600">
                                {filter === 'all'
                                    ? 'There are no swap requests at the moment.'
                                    : `There are no ${filter} swap requests.`
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {displayRequests?.map((request) => renderRequestCard(request, true))}
                        </div>
                    )}
                </div>
            )}

            {/* Regular User View - Split into Two Sections */}
            {userRole === 'user' && (
                <>
                    {/* Incoming Requests - Require User's Action */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-blue-50">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Requests for Your Approval</h3>
                                    <p className="text-xs text-gray-600">
                                        {incomingRequests.filter(r => r.status === 'pending').length} pending your response
                                    </p>
                                </div>
                            </div>
                        </div>
                        {incomingRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-3">✅</div>
                                <div className="text-gray-900 font-medium mb-1">All caught up!</div>
                                <div className="text-sm text-gray-600">
                                    {filter === 'all'
                                        ? 'No one has requested to swap shifts with you.'
                                        : `No ${filter} requests requiring your approval.`
                                    }
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {incomingRequests.map((request) => renderRequestCard(request, request.status === 'pending'))}
                            </div>
                        )}
                    </div>

                    {/* Outgoing Requests - User Initiated */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-green-50">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Your Swap Requests</h3>
                                    <p className="text-xs text-gray-600">
                                        {outgoingRequests.filter(r => r.status === 'pending').length} awaiting approval from others
                                    </p>
                                </div>
                            </div>
                        </div>
                        {outgoingRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-3">📤</div>
                                <div className="text-gray-900 font-medium mb-1">No outgoing requests</div>
                                <div className="text-sm text-gray-600">
                                    {filter === 'all'
                                        ? 'You haven\'t requested any shift swaps yet.'
                                        : `No ${filter} requests sent by you.`
                                    }
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {outgoingRequests.map((request) => renderRequestCard(request, false))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default RequestsTab;