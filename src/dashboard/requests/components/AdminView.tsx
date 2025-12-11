import { useTranslation } from 'react-i18next';
import {SwapRequest} from "../Types.ts";
import {renderRequestCard} from "./RenderRequestCard.tsx";
import {useToast} from "../../../context/ToastContext";


interface AdminViewProps {
    displayRequests: SwapRequest[] | null;
    filter: 'all' | 'pending' | 'approved' | 'declined';
    setRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminView({displayRequests, filter, setRequests, setSelectedRequest, setShowShareModal}: AdminViewProps) {
    const { t } = useTranslation();
    const { showSuccess, showInfo } = useToast();
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
                    {displayRequests?.map((request) => renderRequestCard({
                        request,
                        showActions: true,
                        canShare: true,
                        setRequests: setRequests,
                        setSelectedRequest: setSelectedRequest,
                        setShowShareModal: setShowShareModal,
                        onApproveSuccess: () => showSuccess(t('requests.toast.approved')),
                        onDeclineSuccess: () => showInfo(t('requests.toast.declined'))
                    }))}
                </div>
            )}
        </div>
    );
}