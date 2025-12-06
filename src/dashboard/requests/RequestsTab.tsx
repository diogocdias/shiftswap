import { useState } from 'react';
import { MOCK_SWAP_REQUESTS } from "./data/mockSwapRequests.ts";
import { SwapRequest } from './Types.ts';
import { AdminView } from "./components/AdminView.tsx";
import { ShareSwapModal } from "./components/ShareModal.tsx";
import { UserView } from "./components/UserView.tsx";
import { getUserRole } from "../../services/sessionService";
import { DEFAULTS } from "../../config/constants";

function RequestsTab() {
    const [requests, setRequests] = useState<SwapRequest[]>(MOCK_SWAP_REQUESTS);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);

    // Get logged-in user ID from constants (TODO: get from auth context in production)
    const LOGGED_IN_USER_ID = DEFAULTS.LOGGED_IN_USER_ID;

    // Get user role from session service
    const userRole = getUserRole();


    const shareToApp = (app: 'whatsapp' | 'telegram' | 'messenger' | 'sms' | 'copy') => {
        if (!selectedRequest) return;

        const shareText = `🔄 Shift Swap Request\n\n` +
            `From: ${selectedRequest.from}\n` +
            `To: ${selectedRequest.to}\n\n` +
            `Giving: ${selectedRequest.fromShift.date} - ${selectedRequest.fromShift.type} (${selectedRequest.fromShift.time})\n` +
            `Taking: ${selectedRequest.toShift.date} - ${selectedRequest.toShift.type} (${selectedRequest.toShift.time})\n\n` +
            `Status: ${selectedRequest.status.toUpperCase()}\n\n` +
            `Can you help cover this shift?`;

        const encodedText = encodeURIComponent(shareText);

        switch (app) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                break;
            case 'telegram':
                window.open(`https://t.me/share/url?text=${encodedText}`, '_blank');
                break;
            case 'messenger':
                window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`, '_blank');
                break;
            case 'sms':
                window.open(`sms:?body=${encodedText}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Swap request details copied to clipboard!');
                }).catch(() => {
                    alert('Failed to copy to clipboard');
                });
                break;
        }

        setShowShareModal(false);
        setSelectedRequest(null);
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
                    <div className="flex gap-1.5 bg-gray-100 rounded-full p-1 w-full portrait:justify-center md:w-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                                filter === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                                filter === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                                filter === 'approved'
                                    ? 'bg-green-100 text-green-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setFilter('declined')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                                filter === 'declined'
                                    ? 'bg-red-100 text-red-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Declined
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin/Team Leader View - All Requests */}
            {(userRole === 'admin' || userRole === 'teamleader') && (
                <AdminView
                    displayRequests={displayRequests}
                    filter={filter}
                    setRequests={setRequests}
                    setSelectedRequest={setSelectedRequest}
                    setShowShareModal={setShowShareModal}
                />
            )}

            {/* Regular User View - Split into Two Sections */}
            {userRole === 'user' && (
                <UserView
                    incomingRequests={incomingRequests}
                    outgoingRequests={outgoingRequests}
                    filter={filter}
                    setRequests={setRequests}
                    setSelectedRequest={setSelectedRequest}
                    setShowShareModal={setShowShareModal}
                />
            )}

            {/* Share Modal */}
            {showShareModal && selectedRequest && (
                <ShareSwapModal
                    show={showShareModal}
                    request={selectedRequest}
                    setShow={setShowShareModal}
                    setRequest={setSelectedRequest}
                    shareToApp={shareToApp}
                />
            )}
        </div>
    );
}

export default RequestsTab;