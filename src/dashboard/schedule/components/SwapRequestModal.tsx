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
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="space-y-3">
                        {/* Step 1: Select team member to swap with */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

                        {/* Step 3: Add your shifts to swap */}
                        {swapFormData.targetUserId && swapFormData.targetDate && (
                            <div className="border-t pt-3">
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Shifts to Swap
                                    </label>

                                    {/* Display added shifts */}
                                    {swapFormData.myShifts && swapFormData.myShifts.length > 0 && (
                                        <div className="space-y-1.5 mb-2">
                                            {swapFormData.myShifts.map((shift, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {new Date(shift.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-600 ml-2">
                                                            {SHIFT_LEGENDS[shift.shiftType].label}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newShifts = swapFormData.myShifts.filter((_, i) => i !== index);
                                                            onUpdateFormData({
                                                                ...swapFormData,
                                                                myShifts: newShifts,
                                                            });
                                                        }}
                                                        className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition"
                                                        title="Remove shift"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add shift button and selector */}
                                    <div className="flex gap-2">
                                        <select
                                            id="shift-selector"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">Select a shift to add...</option>
                                            {getAvailableShifts(loggedInUserId).map((shift, idx) => (
                                                <option key={idx} value={`${shift.date}-${shift.shiftType}`}>
                                                    {new Date(shift.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })} - {SHIFT_LEGENDS[shift.shiftType].label} ({SHIFT_LEGENDS[shift.shiftType].time})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const selector = document.getElementById('shift-selector') as HTMLSelectElement;
                                                if (selector.value) {
                                                    // Split from the last dash to handle ISO date format (2024-12-05-M)
                                                    const lastDashIndex = selector.value.lastIndexOf('-');
                                                    const date = selector.value.substring(0, lastDashIndex);
                                                    const shiftType = selector.value.substring(lastDashIndex + 1);
                                                    const newShift = { date, shiftType: shiftType as 'M' | 'A' | 'N' };

                                                    // Check if shift is already added
                                                    const alreadyAdded = swapFormData.myShifts?.some(
                                                        s => s.date === date && s.shiftType === shiftType
                                                    );

                                                    if (!alreadyAdded) {
                                                        onUpdateFormData({
                                                            ...swapFormData,
                                                            myShifts: [...(swapFormData.myShifts || []), newShift],
                                                        });
                                                        selector.value = '';
                                                    }
                                                }
                                            }}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Show summary after shift selection */}
                        {swapFormData.targetUserId && swapFormData.targetDate && swapFormData.myShifts && swapFormData.myShifts.length > 0 && (
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                                <div className="text-sm font-semibold text-blue-900 mb-2">Shift Summary</div>
                                <div className="space-y-2">
                                    {/* Your shifts to give */}
                                    <div className="bg-white rounded-md p-2 border border-blue-200">
                                        <div className="text-xs font-medium text-gray-600 mb-1.5">You Give</div>
                                        <div className="space-y-1">
                                            {swapFormData.myShifts.map((shift, index) => (
                                                <div key={index} className="text-sm">
                                                    <span className="font-semibold text-gray-900">
                                                        {new Date(shift.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-xs text-gray-700 ml-2">
                                                        {SHIFT_LEGENDS[shift.shiftType].label} - {SHIFT_LEGENDS[shift.shiftType].time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Exchange arrow */}
                                    <div className="flex justify-center py-1">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>

                                    {/* Their shift to take */}
                                    <div className="bg-white rounded-md p-2 border border-blue-200">
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

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!swapFormData.targetUserId || !swapFormData.targetDate || !swapFormData.myShifts || swapFormData.myShifts.length === 0}
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