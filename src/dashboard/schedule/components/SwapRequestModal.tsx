import { SwapFormData, TeamMember } from "../Types";
import { SHIFT_LEGENDS } from "../ShiftConstants";

interface SwapRequestModalProps {
    isOpen: boolean;
    swapFormData: SwapFormData | null;
    onClose: () => void;
    onSubmit: () => void;
    onUpdateFormData: (data: SwapFormData) => void;
    teamMembers: TeamMember[];
    loggedInUserId: string;
    getAvailableShifts: (userId: string) => Array<{ date: string; shiftType: 'M' | 'A' | 'N' }>;
}

export default function SwapRequestModal({
                                             isOpen,
                                             swapFormData,
                                             onClose,
                                             onSubmit,
                                             onUpdateFormData,
                                             teamMembers,
                                             loggedInUserId,
                                             getAvailableShifts,
                                         }: SwapRequestModalProps) {
    if (!isOpen || !swapFormData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Request Shift Swap
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Scenario 1: User's own shift - giving it away */}
                        {swapFormData.myDate && !swapFormData.targetUserId && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-sm font-medium text-blue-900 mb-2">Your Shift to Give</div>
                                    <div className="text-lg font-semibold text-blue-700">
                                        {new Date(swapFormData.myDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        {SHIFT_LEGENDS[swapFormData.myShift].label} - {SHIFT_LEGENDS[swapFormData.myShift].time}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Team Member
                                    </label>
                                    <select
                                        value={swapFormData.targetUserId}
                                        onChange={(e) => onUpdateFormData({
                                            ...swapFormData,
                                            targetUserId: e.target.value,
                                            targetDate: '',
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Choose a team member...</option>
                                        {teamMembers.filter(m => m.id !== loggedInUserId).map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {swapFormData.targetUserId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Their Shift to Take
                                        </label>
                                        <select
                                            value={swapFormData.targetDate ? `${swapFormData.targetDate}-${swapFormData.targetShift}` : ''}
                                            onChange={(e) => {
                                                const [date, shift] = e.target.value.split('-');
                                                onUpdateFormData({
                                                    ...swapFormData,
                                                    targetDate: date,
                                                    targetShift: shift as 'M' | 'A' | 'N',
                                                });
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Choose a shift...</option>
                                            {getAvailableShifts(swapFormData.targetUserId).map((shift, idx) => (
                                                <option key={idx} value={`${shift.date}-${shift.shiftType}`}>
                                                    {new Date(shift.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })} - {SHIFT_LEGENDS[shift.shiftType].label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Scenario 2: Someone else's shift - taking it */}
                        {swapFormData.targetUserId && swapFormData.targetDate && !swapFormData.myDate && (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-sm font-medium text-green-900 mb-2">Shift to Take</div>
                                    <div className="text-lg font-semibold text-green-700">
                                        {new Date(swapFormData.targetDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        {SHIFT_LEGENDS[swapFormData.targetShift].label} - {SHIFT_LEGENDS[swapFormData.targetShift].time}
                                    </div>
                                    <div className="text-sm text-green-800 mt-2">
                                        From: {teamMembers.find(m => m.id === swapFormData.targetUserId)?.name}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Your Shift to Give
                                    </label>
                                    <select
                                        value={swapFormData.myDate ? `${swapFormData.myDate}-${swapFormData.myShift}` : ''}
                                        onChange={(e) => {
                                            const [date, shift] = e.target.value.split('-');
                                            onUpdateFormData({
                                                ...swapFormData,
                                                myDate: date,
                                                myShift: shift as 'M' | 'A' | 'N',
                                            });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Choose a shift...</option>
                                        {getAvailableShifts(loggedInUserId).map((shift, idx) => (
                                            <option key={idx} value={`${shift.date}-${shift.shiftType}`}>
                                                {new Date(shift.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} - {SHIFT_LEGENDS[shift.shiftType].label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Summary when both shifts are selected */}
                        {swapFormData.targetUserId && swapFormData.targetDate && swapFormData.myDate && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="text-sm font-medium text-gray-900 mb-3">Swap Summary</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">You give:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(swapFormData.myDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {swapFormData.myShift}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">You get:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(swapFormData.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {swapFormData.targetShift}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-300">
                                        <span className="text-gray-600">With: </span>
                                        <span className="font-medium text-gray-900">
                                            {teamMembers.find(m => m.id === swapFormData.targetUserId)?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!swapFormData.targetUserId || !swapFormData.targetDate || !swapFormData.myDate}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Request Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}