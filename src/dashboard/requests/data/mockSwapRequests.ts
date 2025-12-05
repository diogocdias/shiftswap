// Mock data - replace with actual API call
import {SwapRequest} from "../Types.ts";

export const MOCK_SWAP_REQUESTS: SwapRequest[] = [
    {
        id: 1,
        from: 'Sarah Johnson',
        fromId: '1',
        to: 'Mike Chen',
        toId: '2',
        fromShift: {
            date: 'Dec 3',
            time: '2:00 PM - 10:00 PM',
            type: 'Afternoon Shift'
        },
        toShift: {
            date: 'Dec 5',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        status: 'pending',
        createdAt: '2024-12-01T10:30:00Z'
    },
    {
        id: 2,
        from: 'Emily Davis',
        fromId: '3',
        to: 'Sarah Johnson',
        toId: '1',
        fromShift: {
            date: 'Dec 8',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        toShift: {
            date: 'Dec 10',
            time: '10:00 PM - 6:00 AM',
            type: 'Night Shift'
        },
        status: 'pending',
        createdAt: '2024-12-02T14:15:00Z'
    },
    {
        id: 3,
        from: 'Sarah Johnson',
        fromId: '1',
        to: 'James Wilson',
        toId: '4',
        fromShift: {
            date: 'Dec 12',
            time: '10:00 PM - 6:00 AM',
            type: 'Night Shift'
        },
        toShift: {
            date: 'Dec 14',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        status: 'approved',
        createdAt: '2024-11-30T09:00:00Z'
    },
    {
        id: 4,
        from: 'Mike Chen',
        fromId: '2',
        to: 'Sarah Johnson',
        toId: '1',
        fromShift: {
            date: 'Dec 15',
            time: '2:00 PM - 10:00 PM',
            type: 'Afternoon Shift'
        },
        toShift: {
            date: 'Dec 16',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        fromShifts: [
            {
                date: 'Dec 15',
                time: '2:00 PM - 10:00 PM',
                type: 'Afternoon Shift'
            },
            {
                date: 'Dec 18',
                time: '10:00 PM - 6:00 AM',
                type: 'Night Shift'
            }
        ],
        toShifts: [
            {
                date: 'Dec 16',
                time: '8:00 AM - 4:00 PM',
                type: 'Day Shift'
            },
            {
                date: 'Dec 19',
                time: '2:00 PM - 10:00 PM',
                type: 'Afternoon Shift'
            },
            {
                date: 'Dec 22',
                time: '8:00 AM - 4:00 PM',
                type: 'Day Shift'
            }
        ],
        status: 'pending',
        createdAt: '2024-12-03T11:20:00Z'
    },
    {
        id: 5,
        from: 'James Wilson',
        fromId: '4',
        to: 'Emily Davis',
        toId: '3',
        fromShift: {
            date: 'Dec 20',
            time: '8:00 AM - 4:00 PM',
            type: 'Day Shift'
        },
        toShift: {
            date: 'Dec 21',
            time: '10:00 PM - 6:00 AM',
            type: 'Night Shift'
        },
        fromShifts: [
            {
                date: 'Dec 20',
                time: '8:00 AM - 4:00 PM',
                type: 'Day Shift'
            },
            {
                date: 'Dec 23',
                time: '2:00 PM - 10:00 PM',
                type: 'Afternoon Shift'
            },
            {
                date: 'Dec 26',
                time: '8:00 AM - 4:00 PM',
                type: 'Day Shift'
            }
        ],
        toShifts: [
            {
                date: 'Dec 21',
                time: '10:00 PM - 6:00 AM',
                type: 'Night Shift'
            },
            {
                date: 'Dec 24',
                time: '10:00 PM - 6:00 AM',
                type: 'Night Shift'
            }
        ],
        status: 'declined',
        createdAt: '2024-12-02T16:45:00Z'
    },
];