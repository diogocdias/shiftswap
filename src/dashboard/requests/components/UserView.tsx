import React from "react";
import { useTranslation } from 'react-i18next';
import { SwapRequest, AnySwapRequest, isMultiPersonSwap } from "../Types.ts";
import { renderRequestCard } from "./RenderRequestCard.tsx";
import { MultiPersonRequestCard } from "./MultiPersonRequestCard.tsx";
import { useToast } from "../../../context/ToastContext";

interface UserViewProps {
    incomingRequests: AnySwapRequest[];
    outgoingRequests: AnySwapRequest[];
    filter: string;
    setRequests: React.Dispatch<React.SetStateAction<AnySwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
    loggedInUserId: string;
}

export const UserView: React.FC<UserViewProps> = ({
                                                      incomingRequests,
                                                      outgoingRequests,
                                                      filter,
                                                      setRequests,
                                                      setSelectedRequest,
                                                      setShowShareModal,
                                                      loggedInUserId
                                                  }) => {
    const { t } = useTranslation();
    const { showSuccess, showInfo } = useToast();

    const renderIncomingRequest = (request: AnySwapRequest) => {
        if (isMultiPersonSwap(request)) {
            return (
                <MultiPersonRequestCard
                    key={request.id}
                    request={request}
                    showActions={request.status === 'pending'}
                    canShare={false}
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
            showActions: request.status === 'pending',
            canShare: false,
            setRequests: setRequests as React.Dispatch<React.SetStateAction<SwapRequest[]>>,
            setSelectedRequest,
            setShowShareModal,
            onApproveSuccess: () => showSuccess(t('requests.toast.approved')),
            onDeclineSuccess: () => showInfo(t('requests.toast.declined'))
        });
    };

    const renderOutgoingRequest = (request: AnySwapRequest) => {
        if (isMultiPersonSwap(request)) {
            return (
                <MultiPersonRequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
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
            showActions: false,
            canShare: true,
            setRequests: setRequests as React.Dispatch<React.SetStateAction<SwapRequest[]>>,
            setSelectedRequest,
            setShowShareModal,
            onApproveSuccess: () => showSuccess(t('requests.toast.approved')),
            onDeclineSuccess: () => showInfo(t('requests.toast.declined'))
        });
    };

    return (
        <>
            {/* Incoming Requests */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t('requests.requestsForApproval')}</h3>
                            <p className="text-xs text-gray-600">
                                {t('requests.pendingYourResponse', { count: incomingRequests.filter(r => r.status === 'pending').length })}
                            </p>
                        </div>
                    </div>
                </div>
                {incomingRequests.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <div className="text-gray-900 font-medium mb-1">{t('requests.allCaughtUp')}</div>
                        <div className="text-sm text-gray-600">
                            {filter === 'all'
                                ? t('requests.noSwapRequestsFromOthers')
                                : t('requests.noFilteredApprovalRequests', { filter: t(`requests.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).toLowerCase() })
                            }
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {incomingRequests.map(renderIncomingRequest)}
                    </div>
                )}
            </div>

            {/* Outgoing Requests */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t('requests.yourSwapRequests')}</h3>
                            <p className="text-xs text-gray-600">
                                {t('requests.awaitingApproval', { count: outgoingRequests.filter(r => r.status === 'pending').length })}
                            </p>
                        </div>
                    </div>
                </div>
                {outgoingRequests.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">📤</div>
                        <div className="text-gray-900 font-medium mb-1">{t('requests.noOutgoingRequests')}</div>
                        <div className="text-sm text-gray-600">
                            {filter === 'all'
                                ? t('requests.noSwapRequestsYet')
                                : t('requests.noFilteredSentRequests', { filter: t(`requests.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).toLowerCase() })
                            }
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {outgoingRequests.map(renderOutgoingRequest)}
                    </div>
                )}
            </div>
        </>
    );
};
