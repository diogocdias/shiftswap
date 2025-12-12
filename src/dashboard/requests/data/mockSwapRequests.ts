// Mock data - replace with actual API call
import { SwapRequest, MultiPersonSwapRequest, AnySwapRequest } from "../Types.ts";

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

// Multi-person swap request examples
export const MOCK_MULTI_PERSON_SWAPS: MultiPersonSwapRequest[] = [
    {
        id: 100,
        isMultiPerson: true,
        participants: [
            { id: '1', name: 'Sarah Johnson' },
            { id: '2', name: 'Mike Chen' },
            { id: '3', name: 'Emily Davis' },
        ],
        transfers: [
            {
                fromUserId: '1',
                fromUserName: 'Sarah Johnson',
                toUserId: '2',
                toUserName: 'Mike Chen',
                shift: {
                    date: 'Dec 15',
                    time: '6:00 AM - 2:00 PM',
                    type: 'Morning Shift',
                },
            },
            {
                fromUserId: '2',
                fromUserName: 'Mike Chen',
                toUserId: '3',
                toUserName: 'Emily Davis',
                shift: {
                    date: 'Dec 16',
                    time: '2:00 PM - 10:00 PM',
                    type: 'Afternoon Shift',
                },
            },
            {
                fromUserId: '3',
                fromUserName: 'Emily Davis',
                toUserId: '1',
                toUserName: 'Sarah Johnson',
                shift: {
                    date: 'Dec 17',
                    time: '10:00 PM - 6:00 AM',
                    type: 'Night Shift',
                },
            },
        ],
        status: 'pending',
        createdAt: '2024-12-10T09:30:00Z',
        createdBy: 'Sarah Johnson',
        createdById: '1',
    },
    {
        id: 101,
        isMultiPerson: true,
        participants: [
            { id: '1', name: 'Sarah Johnson' },
            { id: '4', name: 'James Wilson' },
            { id: '5', name: 'Lisa Anderson' },
            { id: '6', name: 'Robert Taylor' },
        ],
        transfers: [
            {
                fromUserId: '1',
                fromUserName: 'Sarah Johnson',
                toUserId: '4',
                toUserName: 'James Wilson',
                shift: {
                    date: 'Dec 20',
                    time: '6:00 AM - 2:00 PM',
                    type: 'Morning Shift',
                },
            },
            {
                fromUserId: '1',
                fromUserName: 'Sarah Johnson',
                toUserId: '5',
                toUserName: 'Lisa Anderson',
                shift: {
                    date: 'Dec 21',
                    time: '2:00 PM - 10:00 PM',
                    type: 'Afternoon Shift',
                },
            },
            {
                fromUserId: '4',
                fromUserName: 'James Wilson',
                toUserId: '6',
                toUserName: 'Robert Taylor',
                shift: {
                    date: 'Dec 22',
                    time: '10:00 PM - 6:00 AM',
                    type: 'Night Shift',
                },
            },
            {
                fromUserId: '5',
                fromUserName: 'Lisa Anderson',
                toUserId: '1',
                toUserName: 'Sarah Johnson',
                shift: {
                    date: 'Dec 23',
                    time: '6:00 AM - 2:00 PM',
                    type: 'Morning Shift',
                },
            },
            {
                fromUserId: '6',
                fromUserName: 'Robert Taylor',
                toUserId: '4',
                toUserName: 'James Wilson',
                shift: {
                    date: 'Dec 24',
                    time: '2:00 PM - 10:00 PM',
                    type: 'Afternoon Shift',
                },
            },
        ],
        status: 'approved',
        createdAt: '2024-12-08T14:15:00Z',
        createdBy: 'Sarah Johnson',
        createdById: '1',
    },
];

// Combined requests for easy access
export const ALL_MOCK_REQUESTS: AnySwapRequest[] = [
    ...MOCK_SWAP_REQUESTS,
    ...MOCK_MULTI_PERSON_SWAPS,
];