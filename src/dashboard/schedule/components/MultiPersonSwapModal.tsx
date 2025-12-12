import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TeamMember } from "../Types";
import { SHIFT_LEGENDS } from "../ShiftConstants";

interface SelectedShift {
    userId: string;
    date: string;
    shiftType: 'M' | 'A' | 'N';
}

interface ShiftAssignment {
    shiftId: string; // unique identifier: `${userId}-${date}-${shiftType}`
    originalOwner: string;
    newOwner: string;
    date: string;
    shiftType: 'M' | 'A' | 'N';
}

interface MultiPersonSwapModalProps {
    isOpen: boolean;
    selectedShifts: SelectedShift[];
    onClose: () => void;
    onSubmit: (assignments: ShiftAssignment[]) => void;
    teamMembers: TeamMember[];
    loggedInUserId: string;
}

export default function MultiPersonSwapModal({
    isOpen,
    selectedShifts,
    onClose,
    onSubmit,
    teamMembers,
    loggedInUserId,
}: MultiPersonSwapModalProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    // Get unique participants from selected shifts
    const participants = useMemo(() => {
        const uniqueUserIds = [...new Set(selectedShifts.map(s => s.userId))];
        return uniqueUserIds.map(userId => {
            const member = teamMembers.find(m => m.id === userId);
            return {
                id: userId,
                name: member?.name || t('schedule.multiPersonSwap.unknownUser'),
                shifts: selectedShifts.filter(s => s.userId === userId),
            };
        });
    }, [selectedShifts, teamMembers, t]);

    // Generate a unique ID for each shift
    const getShiftId = (shift: SelectedShift) => `${shift.userId}-${shift.date}-${shift.shiftType}`;

    // Get the assigned owner for a shift (defaults to original owner)
    const getAssignedOwner = (shift: SelectedShift) => {
        const shiftId = getShiftId(shift);
        return assignments[shiftId] || shift.userId;
    };

    // Update assignment for a shift
    const handleAssignmentChange = (shift: SelectedShift, newOwnerId: string) => {
        const shiftId = getShiftId(shift);
        setAssignments(prev => ({
            ...prev,
            [shiftId]: newOwnerId,
        }));
    };

    // Calculate the summary - who ends up with which shifts
    const summary = useMemo(() => {
        const result: Record<string, Array<{ date: string; shiftType: 'M' | 'A' | 'N'; fromUser: string }>> = {};

        participants.forEach(p => {
            result[p.id] = [];
        });

        selectedShifts.forEach(shift => {
            const newOwner = getAssignedOwner(shift);
            if (!result[newOwner]) {
                result[newOwner] = [];
            }
            result[newOwner].push({
                date: shift.date,
                shiftType: shift.shiftType,
                fromUser: shift.userId,
            });
        });

        return result;
    }, [selectedShifts, assignments, participants]);

    // Check if the swap is valid (at least one shift reassignment)
    const isValidSwap = useMemo(() => {
        return selectedShifts.some(shift => {
            const newOwner = getAssignedOwner(shift);
            return newOwner !== shift.userId;
        });
    }, [selectedShifts, assignments]);

    const handleSubmit = async () => {
        if (!isValidSwap) return;

        setIsLoading(true);
        try {
            const assignmentList: ShiftAssignment[] = selectedShifts
                .filter(shift => getAssignedOwner(shift) !== shift.userId)
                .map(shift => ({
                    shiftId: getShiftId(shift),
                    originalOwner: shift.userId,
                    newOwner: getAssignedOwner(shift),
                    date: shift.date,
                    shiftType: shift.shiftType,
                }));

            await onSubmit(assignmentList);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getUserName = (userId: string) => {
        if (userId === loggedInUserId) return t('schedule.multiPersonSwap.you');
        const member = teamMembers.find(m => m.id === userId);
        return member?.name || t('schedule.multiPersonSwap.unknownUser');
    };

    const getShortName = (userId: string) => {
        if (userId === loggedInUserId) return t('schedule.multiPersonSwap.you');
        const member = teamMembers.find(m => m.id === userId);
        if (!member?.name) return '?';
        const names = member.name.split(' ');
        if (names.length >= 2) {
            return `${names[0]} ${names[names.length - 1][0]}.`;
        }
        return names[0];
    };

    if (!isOpen || selectedShifts.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-gray-900">
                            {t('schedule.swapModal.submittingRequest')}
                        </span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('schedule.multiPersonSwap.title')}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {t('schedule.multiPersonSwap.subtitle', { count: participants.length })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Participants and their shifts */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">
                            {t('schedule.multiPersonSwap.assignShifts')}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {t('schedule.multiPersonSwap.assignShiftsDescription')}
                        </p>

                        {participants.map((participant) => (
                            <div
                                key={participant.id}
                                className={`border rounded-lg p-3 ${
                                    participant.id === loggedInUserId
                                        ? 'border-blue-300 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                                        participant.id === loggedInUserId ? 'bg-blue-600' : 'bg-gray-500'
                                    }`}>
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-medium text-sm text-gray-900">
                                            {participant.id === loggedInUserId
                                                ? t('schedule.multiPersonSwap.you')
                                                : participant.name}
                                        </span>
                                        {participant.id === loggedInUserId && (
                                            <span className="text-xs text-blue-600 ml-1">
                                                ({participant.name})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {participant.shifts.map((shift) => {
                                        const shiftInfo = SHIFT_LEGENDS[shift.shiftType];
                                        const assignedTo = getAssignedOwner(shift);
                                        const isReassigned = assignedTo !== shift.userId;

                                        return (
                                            <div
                                                key={getShiftId(shift)}
                                                className={`flex items-center gap-2 p-2 rounded border ${
                                                    isReassigned
                                                        ? 'border-green-300 bg-green-50'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className={`${shiftInfo.color} w-7 h-7 rounded flex items-center justify-center font-semibold text-xs flex-shrink-0`}>
                                                    {shift.shiftType}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatDate(shift.date)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {shiftInfo.label}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    <select
                                                        value={assignedTo}
                                                        onChange={(e) => handleAssignmentChange(shift, e.target.value)}
                                                        className={`text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                            isReassigned
                                                                ? 'border-green-400 bg-green-100 text-green-800'
                                                                : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {participants.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.id === loggedInUserId
                                                                    ? t('schedule.multiPersonSwap.you')
                                                                    : getShortName(p.id)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            {t('schedule.multiPersonSwap.resultSummary')}
                        </h3>

                        {!isValidSwap ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-yellow-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-sm">
                                        {t('schedule.multiPersonSwap.noChangesWarning')}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {participants.map((participant) => {
                                    const receivedShifts = summary[participant.id] || [];
                                    const givenShifts = selectedShifts.filter(
                                        s => s.userId === participant.id && getAssignedOwner(s) !== participant.id
                                    );

                                    if (receivedShifts.length === 0 && givenShifts.length === 0) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={participant.id}
                                            className={`border rounded-lg p-3 ${
                                                participant.id === loggedInUserId
                                                    ? 'border-blue-300 bg-blue-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="font-medium text-sm text-gray-900 mb-2">
                                                {getUserName(participant.id)}
                                            </div>

                                            {/* Shifts given away */}
                                            {givenShifts.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="text-xs text-red-600 font-medium mb-1">
                                                        {t('schedule.multiPersonSwap.gives')}:
                                                    </div>
                                                    <div className="space-y-1">
                                                        {givenShifts.map(shift => {
                                                            const shiftInfo = SHIFT_LEGENDS[shift.shiftType];
                                                            const newOwner = getAssignedOwner(shift);
                                                            return (
                                                                <div
                                                                    key={getShiftId(shift)}
                                                                    className="flex items-center gap-1 text-xs text-gray-600"
                                                                >
                                                                    <span className={`${shiftInfo.color} w-5 h-5 rounded flex items-center justify-center font-semibold text-[10px]`}>
                                                                        {shift.shiftType}
                                                                    </span>
                                                                    <span>{formatDate(shift.date)}</span>
                                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                    </svg>
                                                                    <span className="font-medium">{getShortName(newOwner)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Shifts received */}
                                            {receivedShifts.filter(s => s.fromUser !== participant.id).length > 0 && (
                                                <div>
                                                    <div className="text-xs text-green-600 font-medium mb-1">
                                                        {t('schedule.multiPersonSwap.receives')}:
                                                    </div>
                                                    <div className="space-y-1">
                                                        {receivedShifts
                                                            .filter(s => s.fromUser !== participant.id)
                                                            .map((shift, idx) => {
                                                                const shiftInfo = SHIFT_LEGENDS[shift.shiftType];
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-1 text-xs text-gray-600"
                                                                    >
                                                                        <span className={`${shiftInfo.color} w-5 h-5 rounded flex items-center justify-center font-semibold text-[10px]`}>
                                                                            {shift.shiftType}
                                                                        </span>
                                                                        <span>{formatDate(shift.date)}</span>
                                                                        <span className="text-gray-400">
                                                                            {t('schedule.multiPersonSwap.from')} {getShortName(shift.fromUser)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !isValidSwap}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {t('schedule.multiPersonSwap.submitRequest')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
