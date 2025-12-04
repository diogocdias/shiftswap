import {SwapRequest} from "../Types.ts";

interface RenderRequestCardProps {
    request: SwapRequest;
    showActions: boolean;
    canShare: boolean;
    setRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Render a single request card
export const renderRequestCard = ({
                                      request,
                                      showActions,
                                      canShare,
                                      setRequests,
                                      setSelectedRequest,
                                      setShowShareModal
                                  }: RenderRequestCardProps) => {

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
            req.id === requestId ? {...req, status: 'approved' as const} : req
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
            req.id === requestId ? {...req, status: 'declined' as const} : req
        ));

        alert('Swap request declined.');
    };

    const handleShare = (request: SwapRequest) => {
        setSelectedRequest(request);
        setShowShareModal(true);
    };

    return <div key={request.id} className="p-6">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-medium text-blue-700">
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
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                    </span>
                {request.status === 'pending' && canShare && (
                    <button
                        onClick={() => handleShare(request)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Share this swap request"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                This swap has been approved
            </div>
        )}

        {request.status === 'declined' && (
            <div className="flex items-center gap-2 text-sm text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
                This swap has been declined
            </div>
        )}
    </div>
};

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

