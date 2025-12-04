import React from "react";
import { SwapRequest } from "../Types.ts";
import { renderRequestCard } from "./RenderRequestCard.tsx";

interface UserViewProps {
    incomingRequests: SwapRequest[];
    outgoingRequests: SwapRequest[];
    filter: string;
    setRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserView: React.FC<UserViewProps> = ({
                                                      incomingRequests,
                                                      outgoingRequests,
                                                      filter,
                                                      setRequests,
                                                      setSelectedRequest,
                                                      setShowShareModal
                                                  }) => {
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
                        {incomingRequests.map((request) => renderRequestCard({
                            request,
                            showActions: request.status === 'pending',
                            canShare: false,
                            setRequests,
                            setSelectedRequest,
                            setShowShareModal
                        }))}
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
                        {outgoingRequests.map((request) => renderRequestCard({
                            request,
                            showActions: false,
                            canShare: true,
                            setRequests,
                            setSelectedRequest,
                            setShowShareModal
                        }))}
                    </div>
                )}
            </div>
        </>
    );
};
