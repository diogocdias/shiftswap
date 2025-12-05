export interface ShiftData {
    [personId: string]: {
        [date: string]: Array<'M' | 'A' | 'N' | 'R' | 'D'>;
    };
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
}

export interface SwapRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromShift: {
        date: string;
        shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
    };
    toShift: {
        date: string;
        shiftType: 'M' | 'A' | 'N' | 'R' | 'D';
    };
    status: 'pending' | 'approved' | 'declined';
    createdAt: string;
}

export interface SwapFormData {
    targetUserId: string;
    targetDate: string;
    targetShift: 'M' | 'A' | 'N' | 'R' | 'D';
    myDate: string;
    myShift: 'M' | 'A' | 'N' | 'R' | 'D';
    myShifts: Array<{ date: string; shiftType: 'M' | 'A' | 'N' | 'R' | 'D' }>;
    targetShifts: Array<{ date: string; shiftType: 'M' | 'A' | 'N' | 'R' | 'D' }>;
}