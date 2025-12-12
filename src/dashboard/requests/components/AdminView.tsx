import { useTranslation } from 'react-i18next';
import { SwapRequest, AnySwapRequest, isMultiPersonSwap } from "../Types.ts";
import { renderRequestCard } from "./RenderRequestCard.tsx";
import { MultiPersonRequestCard } from "./MultiPersonRequestCard.tsx";
import { useToast } from "../../../context/ToastContext";


interface AdminViewProps {
    displayRequests: AnySwapRequest[] | null;
    filter: 'all' | 'pending' | 'approved' | 'declined';
    setRequests: React.Dispatch<React.SetStateAction<AnySwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
    loggedInUserId: string;
}

export function AdminView({displayRequests, filter, setRequests, setSelectedRequest, setShowShareModal, loggedInUserId}: AdminViewProps) {
    const { t } = useTranslation();
    const { showSuccess, showInfo } = useToast();

    const renderRequest = (request: AnySwapRequest) => {
        if (isMultiPersonSwap(request)) {
            return (
                <MultiPersonRequestCard
                    key={request.id}
                    request={request}
                    showActions={true}
                    canShare={true}
                    setRequests={setRequests}
                    setShowShareModal={setShowShareModal}
                    onApproveSuccess={() => showSuccess(t('requests.toast.approved'))}
                    onDeclineSuccess={() => showInfo(t('requests.toast.declined'))}
                    loggedInUserId={loggedInUserId}
                />
            );
        }

        return renderRequestCard({
            request,
            showActions: true,
            canShare: true,
            setRequests: setRequests as React.Dispatch<React.SetStateAction<SwapRequest[]>>,
            setSelectedRequest: setSelectedRequest,
            setShowShareModal: setShowShareModal,
            onApproveSuccess: () => showSuccess(t('requests.toast.approved')),
            onDeclineSuccess: () => showInfo(t('requests.toast.declined'))
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {displayRequests && displayRequests.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <div className="text-gray-900 font-medium mb-1">{t('requests.noRequests')}</div>
                    <div className="text-sm text-gray-600">
                        {filter === 'all'
                            ? t('requests.noRequestsAtMoment')
                            : t('requests.noFilteredRequests', { filter: t(`requests.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).toLowerCase() })
                        }
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {displayRequests?.map(renderRequest)}
                </div>
            )}
        </div>
    );
}