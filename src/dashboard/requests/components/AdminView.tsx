import {SwapRequest} from "../Types.ts";
import {renderRequestCard} from "./RenderRequestCard.tsx";


interface AdminViewProps {
    displayRequests: SwapRequest[] | null;
    filter: 'all' | 'pending' | 'approved' | 'declined';
    setRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
    setSelectedRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminView({displayRequests, filter, setRequests, setSelectedRequest, setShowShareModal}: AdminViewProps) {
    return (
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
                    {displayRequests?.map((request) => renderRequestCard({
                        request,
                        showActions: true,
                        canShare: true,
                        setRequests: setRequests,
                        setSelectedRequest: setSelectedRequest,
                        setShowShareModal: setShowShareModal
                    }))}
                </div>
            )}
        </div>
    );
}