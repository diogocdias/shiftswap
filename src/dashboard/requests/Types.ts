export interface SwapRequest {
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
    fromShifts?: Array<{
        date: string;
        time: string;
        type: string;
    }>;
    toShifts?: Array<{
        date: string;
        time: string;
        type: string;
    }>;
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
}

// Participant in a multi-person swap
export interface SwapParticipant {
    id: string;
    name: string;
}

// A single shift transfer within a multi-person swap
export interface ShiftTransfer {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    shift: {
        date: string;
        time: string;
        type: string;
    };
}

// Multi-person swap request (3+ participants)
export interface MultiPersonSwapRequest {
    id: number;
    isMultiPerson: true;
    participants: SwapParticipant[];
    transfers: ShiftTransfer[];
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
    createdBy: string;
    createdById: string;
}

// Union type for all request types
export type AnySwapRequest = SwapRequest | MultiPersonSwapRequest;

// Type guard to check if a request is multi-person
export function isMultiPersonSwap(request: AnySwapRequest): request is MultiPersonSwapRequest {
    return 'isMultiPerson' in request && request.isMultiPerson === true;
}