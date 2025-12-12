import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiPersonSwapRequest, AnySwapRequest } from '../Types';
import { SwapPreviewModal } from './SwapPreviewModal';

interface MultiPersonRequestCardProps {
    request: MultiPersonSwapRequest;
    showActions: boolean;
    canShare: boolean;
    setRequests: React.Dispatch<React.SetStateAction<AnySwapRequest[]>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
    onApproveSuccess?: () => void;
    onDeclineSuccess?: () => void;
    loggedInUserId: string;
}

// Avatar component with initials
const UserAvatar = ({ name, size = 'md', highlight = false }: { name: string; size?: 'sm' | 'md'; highlight?: boolean }) => {
    const initials = name.split(' ').map(n => n[0]).join('');
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

    return (
        <div className={`${sizeClasses} ${highlight ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-gray-500'} rounded-full flex items-center justify-center font-semibold text-white shadow-sm flex-shrink-0`}>
            {initials}
        </div>
    );
};

// Get shift type color
const getShiftTypeColor = (shiftType: string) => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type.includes('day')) return 'bg-yellow-100 text-yellow-800';
    if (type.includes('afternoon')) return 'bg-orange-100 text-orange-800';
    if (type.includes('night')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
};

// Get short shift type abbreviation
const getShiftAbbrev = (shiftType: string) => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning') || type.includes('day')) return 'M';
    if (type.includes('afternoon')) return 'A';
    if (type.includes('night')) return 'N';
    return '?';
};

export const MultiPersonRequestCard = ({
    request,
    showActions,
    canShare,
    setRequests,
    setShowShareModal,
    onApproveSuccess,
    onDeclineSuccess,
    loggedInUserId,
}: MultiPersonRequestCardProps) => {
    const { t } = useTranslation();
    const [showPreview, setShowPreview] = useState(false);

    const handleApprove = async (requestId: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Approving multi-person request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'approved' as const } : req
        ));

        onApproveSuccess?.();
    };

    const handleDecline = async (requestId: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Declining multi-person request:', requestId);

        setRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'declined' as const } : req
        ));

        onDeclineSuccess?.();
    };

    // Calculate what each participant gives and receives
    const getParticipantSummary = (participantId: string) => {
        const gives = request.transfers.filter(t => t.fromUserId === participantId);
        const receives = request.transfers.filter(t => t.toUserId === participantId);
        return { gives, receives };
    };

    const isUserInvolved = request.participants.some(p => p.id === loggedInUserId);

    return (
        <div className="mx-4 my-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header - Multi-person indicator */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-white font-medium text-sm">
                        {t('requests.multiPerson.title')}
                    </span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                        {t('requests.multiPerson.participantCount', { count: request.participants.length })}
                    </span>
                </div>
                <div className="text-white/80 text-xs">
                    {t('requests.multiPerson.createdBy', { name: request.createdBy })}
                </div>
            </div>

            {/* Participants row */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 mr-1">{t('requests.multiPerson.participants')}:</span>
                    {request.participants.map((participant, index) => (
                        <div key={participant.id} className="flex items-center gap-1">
                            <UserAvatar
                                name={participant.name}
                                size="sm"
                                highlight={participant.id === loggedInUserId}
                            />
                            <span className={`text-sm ${participant.id === loggedInUserId ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                                {participant.id === loggedInUserId ? t('requests.multiPerson.you') : participant.name.split(' ')[0]}
                            </span>
                            {index < request.participants.length - 1 && (
                                <span className="text-gray-300 mx-1">•</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Transfers visualization */}
            <div className="p-4">
                <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                    {t('requests.multiPerson.shiftTransfers')}
                </div>

                <div className="space-y-2">
                    {request.transfers.map((transfer, index) => {
                        const isFromUser = transfer.fromUserId === loggedInUserId;
                        const isToUser = transfer.toUserId === loggedInUserId;

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-2 p-2 rounded-lg ${
                                    isFromUser || isToUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}
                            >
                                {/* From user */}
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <UserAvatar name={transfer.fromUserName} size="sm" highlight={isFromUser} />
                                    <span className={`text-sm truncate ${isFromUser ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                                        {isFromUser ? t('requests.multiPerson.you') : transfer.fromUserName.split(' ')[0]}
                                    </span>
                                </div>

                                {/* Shift badge */}
                                <div className={`${getShiftTypeColor(transfer.shift.type)} px-2 py-1 rounded text-xs font-semibold flex-shrink-0`}>
                                    {transfer.shift.date} • {getShiftAbbrev(transfer.shift.type)}
                                </div>

                                {/* Arrow */}
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>

                                {/* To user */}
                                <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                                    <span className={`text-sm truncate ${isToUser ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                                        {isToUser ? t('requests.multiPerson.you') : transfer.toUserName.split(' ')[0]}
                                    </span>
                                    <UserAvatar name={transfer.toUserName} size="sm" highlight={isToUser} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary for logged-in user if involved */}
                {isUserInvolved && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs font-medium text-blue-700 mb-2">
                            {t('requests.multiPerson.yourSummary')}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Shifts you give */}
                            <div>
                                <div className="text-xs text-red-600 font-medium mb-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                    </svg>
                                    {t('requests.multiPerson.youGive')}
                                </div>
                                {getParticipantSummary(loggedInUserId).gives.length === 0 ? (
                                    <span className="text-xs text-gray-400">{t('requests.multiPerson.none')}</span>
                                ) : (
                                    getParticipantSummary(loggedInUserId).gives.map((transfer, idx) => (
                                        <div key={idx} className={`${getShiftTypeColor(transfer.shift.type)} text-xs px-2 py-1 rounded mb-1 inline-block mr-1`}>
                                            {transfer.shift.date}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Shifts you receive */}
                            <div>
                                <div className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h14" />
                                    </svg>
                                    {t('requests.multiPerson.youReceive')}
                                </div>
                                {getParticipantSummary(loggedInUserId).receives.length === 0 ? (
                                    <span className="text-xs text-gray-400">{t('requests.multiPerson.none')}</span>
                                ) : (
                                    getParticipantSummary(loggedInUserId).receives.map((transfer, idx) => (
                                        <div key={idx} className={`${getShiftTypeColor(transfer.shift.type)} text-xs px-2 py-1 rounded mb-1 inline-block mr-1`}>
                                            {transfer.shift.date}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {/* Preview button */}
                    <button
                        onClick={() => setShowPreview(true)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title={t('requests.card.preview')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>

                    {/* Share button */}
                    {request.status === 'pending' && canShare && (
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                            title={t('requests.card.share')}
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
                                title={t('requests.card.approve')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDecline(request.id)}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title={t('requests.card.decline')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Status badges */}
                    {request.status === 'approved' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            <span className="text-xs font-medium">{t('requests.card.approved')}</span>
                        </div>
                    )}

                    {request.status === 'declined' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            <span className="text-xs font-medium">{t('requests.card.declined')}</span>
                        </div>
                    )}

                    {request.status === 'pending' && !showActions && !canShare && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className="text-xs font-medium">{t('requests.card.pending')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <SwapPreviewModal
                isOpen={showPreview}
                request={request}
                onClose={() => setShowPreview(false)}
            />
        </div>
    );
};
