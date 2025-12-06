import {SwapRequest} from "../Types.ts";

interface RenderRequestCardProps {
    request: SwapRequest;
    showActions: boolean;
    canShare: boolean;
    setRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
    onApproveSuccess?: (message: string) => void;
    onDeclineSuccess?: (message: string) => void;
}

// Avatar component with initials
const UserAvatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('');

    return (
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-semibold text-white text-sm shadow-sm flex-shrink-0">
            {initials}
        </div>
    );
};

// Swap arrows icon - curved cycling arrows (for horizontal layout)
const SwapArrowsIcon = () => (
    <div className="flex items-center justify-center px-4 md:px-8 flex-shrink-0">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            {/* Top arrow - light blue */}
            <path
                d="M16 3L19 6L16 9"
                stroke="#5CBFDE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19 6H10C6.68629 6 4 8.68629 4 12"
                stroke="#5CBFDE"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Bottom arrow - dark blue */}
            <path
                d="M8 21L5 18L8 15"
                stroke="#1E5F8B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 18H14C17.3137 18 20 15.3137 20 12"
                stroke="#1E5F8B"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

// Swap arrows icon for vertical/portrait layout
const SwapArrowsIconVertical = () => (
    <div className="flex items-center justify-center py-2 flex-shrink-0">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            {/* Top arrow - light blue */}
            <path
                d="M16 3L19 6L16 9"
                stroke="#5CBFDE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19 6H10C6.68629 6 4 8.68629 4 12"
                stroke="#5CBFDE"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Bottom arrow - dark blue */}
            <path
                d="M8 21L5 18L8 15"
                stroke="#1E5F8B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 18H14C17.3137 18 20 15.3137 20 12"
                stroke="#1E5F8B"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

// Get shift type color
const getShiftTypeColor = (shiftType: string) => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type.includes('day')) return 'text-blue-500';
    if (type.includes('afternoon')) return 'text-orange-500';
    if (type.includes('night')) return 'text-indigo-500';
    return 'text-gray-500';
};

// Render a single request card
export const renderRequestCard = ({
                                      request,
                                      showActions,
                                      canShare,
                                      setRequests,
                                      setSelectedRequest,
                                      setShowShareModal,
                                      onApproveSuccess,
                                      onDeclineSuccess
                                  }: RenderRequestCardProps) => {

    const handleApprove = async (requestId: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Approving request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? {...req, status: 'approved' as const} : req
        ));

        onApproveSuccess?.('Swap request approved successfully!');
    };

    const handleDecline = async (requestId: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Declining request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? {...req, status: 'declined' as const} : req
        ));

        onDeclineSuccess?.('Swap request declined.');
    };

    const handleShare = (request: SwapRequest) => {
        setSelectedRequest(request);
        setShowShareModal(true);
    };

    // Extract short shift type (e.g., "Afternoon" from "Afternoon Shift")
    const getShortShiftType = (type: string) => type.split(' ')[0];

    // Get shifts array or fallback to single shift
    const fromShifts = request.fromShifts || [request.fromShift];
    const toShifts = request.toShifts || [request.toShift];

    // Render shift list component
    const ShiftList = ({ shifts }: { shifts: Array<{ date: string; time: string; type: string }> }) => {
        if (shifts.length === 1) {
            return (
                <>
                    <div className="text-base font-bold text-gray-900 mt-0.5">
                        {shifts[0].date}
                    </div>
                    <div className="text-sm text-gray-500">
                        {shifts[0].time}
                    </div>
                </>
            );
        }

        return (
            <div className="mt-0.5">
                {shifts.map((shift, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">{shift.date}</span>
                            <span className={`text-xs ${getShiftTypeColor(shift.type)}`}>
                                {getShortShiftType(shift.type)}
                            </span>
                        </div>
                        {index < shifts.length - 1 && (
                            <div className="text-blue-600 font-bold text-xs my-0.5">+</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Actions component - reused in both layouts
    const ActionsSection = ({ className = "" }: { className?: string }) => (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Share button */}
            {request.status === 'pending' && canShare && (
                <button
                    onClick={() => handleShare(request)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                    title="Share"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                </button>
            )}

            {/* Accept/Decline buttons for pending requests */}
            {request.status === 'pending' && showActions && (
                <>
                    <button
                        onClick={() => handleApprove(request.id)}
                        className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Accept"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDecline(request.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Decline"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </>
            )}

            {/* Status badges for completed requests */}
            {request.status === 'approved' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-xs font-medium">Approved</span>
                </div>
            )}

            {request.status === 'declined' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span className="text-xs font-medium">Declined</span>
                </div>
            )}

            {/* Pending indicator when no actions available */}
            {request.status === 'pending' && !showActions && !canShare && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-xs font-medium">Pending</span>
                </div>
            )}
        </div>
    );

    return (
        <div key={request.id} className="mx-4 my-3 px-6 py-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition">
            {/* Desktop/Landscape Layout - Hidden on small portrait screens */}
            <div className="hidden landscape:flex md:flex items-center">
                {/* Left Shift Section */}
                <div className="flex items-center justify-center gap-4 flex-1">
                    <UserAvatar name={request.from} />
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{request.from}</span>
                            {fromShifts.length === 1 && (
                                <span className={`text-sm ${getShiftTypeColor(fromShifts[0].type)}`}>
                                    {getShortShiftType(fromShifts[0].type)}
                                </span>
                            )}
                        </div>
                        <ShiftList shifts={fromShifts} />
                        <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                            Your Shift{fromShifts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Swap Arrows */}
                <SwapArrowsIcon />

                {/* Right Shift Section */}
                <div className="flex items-center justify-center gap-4 flex-1">
                    <UserAvatar name={request.to} />
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{request.to}</span>
                            {toShifts.length === 1 && (
                                <span className={`text-sm ${getShiftTypeColor(toShifts[0].type)}`}>
                                    {getShortShiftType(toShifts[0].type)}
                                </span>
                            )}
                        </div>
                        <ShiftList shifts={toShifts} />
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                            Proposed Swap{toShifts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Actions Section */}
                <ActionsSection className="pl-6 ml-6 border-l border-gray-200 flex-shrink-0" />
            </div>

            {/* Mobile Portrait Layout - Only shown on small portrait screens */}
            <div className="flex flex-col items-center portrait:flex md:hidden landscape:hidden">
                {/* Top Shift Section (Your Shift) */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <UserAvatar name={request.from} />
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{request.from}</span>
                            {fromShifts.length === 1 && (
                                <span className={`text-sm ${getShiftTypeColor(fromShifts[0].type)}`}>
                                    {getShortShiftType(fromShifts[0].type)}
                                </span>
                            )}
                        </div>
                        <ShiftList shifts={fromShifts} />
                        <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                            Your Shift{fromShifts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Swap Arrows */}
                <SwapArrowsIconVertical />

                {/* Bottom Shift Section (Proposed Swap) */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <UserAvatar name={request.to} />
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{request.to}</span>
                            {toShifts.length === 1 && (
                                <span className={`text-sm ${getShiftTypeColor(toShifts[0].type)}`}>
                                    {getShortShiftType(toShifts[0].type)}
                                </span>
                            )}
                        </div>
                        <ShiftList shifts={toShifts} />
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                            Proposed Swap{toShifts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Actions Section - Bottom row */}
                <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                    <ActionsSection className="justify-center" />
                </div>
            </div>
        </div>
    );
};