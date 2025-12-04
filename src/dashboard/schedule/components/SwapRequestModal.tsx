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
                        {/* Step 1: Select team member to swap with */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Team Member to Swap With
                            </label>
                            <select
                                value={swapFormData.targetUserId || ''}
                                onChange={(e) => onUpdateFormData({
                                    ...swapFormData,
                                    targetUserId: e.target.value,
                                    targetDate: '',
                                    targetShift: 'M',
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

                        {/* Step 2: Show available shifts for selected team member */}
                        {swapFormData.targetUserId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Their Shift to Take
                                </label>
                                <select
                                    value={swapFormData.targetDate ? `${swapFormData.targetDate}-${swapFormData.targetShift}` : ''}
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            onUpdateFormData({
                                                ...swapFormData,
                                                targetDate: '',
                                                targetShift: 'M',
                                            });
                                            return;
                                        }
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
                                            })} - {SHIFT_LEGENDS[shift.shiftType].label} ({SHIFT_LEGENDS[shift.shiftType].time})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Step 3: Show summary after shift selection */}
                        {swapFormData.targetUserId && swapFormData.targetDate && (
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                <div className="text-sm font-semibold text-blue-900 mb-3">Shift Summary</div>
                                <div className="space-y-3">
                                    {/* Your shift to give */}
                                    {swapFormData.myDate && (
                                        <div className="bg-white rounded-md p-3 border border-blue-200">
                                            <div className="text-xs font-medium text-gray-600 mb-1">You Give</div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {new Date(swapFormData.myDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-700">
                                                {SHIFT_LEGENDS[swapFormData.myShift].label} - {SHIFT_LEGENDS[swapFormData.myShift].time}
                                            </div>
                                        </div>
                                    )}

                                    {/* Exchange arrow */}
                                    <div className="flex justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>

                                    {/* Their shift to take */}
                                    <div className="bg-white rounded-md p-3 border border-blue-200">
                                        <div className="text-xs font-medium text-gray-600 mb-1">You Receive</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {new Date(swapFormData.targetDate).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-xs text-gray-700">
                                            {SHIFT_LEGENDS[swapFormData.targetShift].label} - {SHIFT_LEGENDS[swapFormData.targetShift].time}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            From: {teamMembers.find(m => m.id === swapFormData.targetUserId)?.name}
                                        </div>
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