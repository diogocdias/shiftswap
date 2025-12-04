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
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
}