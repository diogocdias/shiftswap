import { useState, useEffect } from 'react';
import { VacationRecord, VacationType, TeamMember } from '../../types/domain';
import { useToast } from '../../context/ToastContext';
import { formatShortDate } from '../../utils/dateUtils';
import {
    getTimeOffRecords,
    setTimeOffRecords,
    subscribeToTimeOff,
    TIME_OFF_TYPES,
} from '../../services/timeOffService';

// Vacation type configuration (using shared config)
const VACATION_TYPES = TIME_OFF_TYPES;

// Mock team members (same as ScheduleTab)
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', role: 'user' },
    { id: '2', name: 'Mike Chen', role: 'user' },
    { id: '3', name: 'Emily Davis', role: 'user' },
    { id: '4', name: 'James Wilson', role: 'user' },
    { id: '5', name: 'Lisa Anderson', role: 'user' },
    { id: '6', name: 'Robert Taylor', role: 'user' },
    { id: '7', name: 'Maria Garcia', role: 'user' },
];

interface VacationFormData {
    userId: string;
    type: VacationType;
    startDate: string;
    endDate: string;
    notes: string;
}

const INITIAL_FORM_DATA: VacationFormData = {
    userId: '',
    type: 'vacation',
    startDate: '',
    endDate: '',
    notes: '',
};

function VacationTab() {
    const { showSuccess, showError, showWarning } = useToast();
    const [vacationRecords, setVacationRecordsLocal] = useState<VacationRecord[]>(() => getTimeOffRecords());
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState<VacationFormData>(INITIAL_FORM_DATA);
    const [editingRecord, setEditingRecord] = useState<VacationRecord | null>(null);
    const [staffFilter, setStaffFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<VacationType | 'all'>('all');

    // Sync with shared time-off service
    useEffect(() => {
        const unsubscribe = subscribeToTimeOff(() => {
            setVacationRecordsLocal(getTimeOffRecords());
        });
        return unsubscribe;
    }, []);

    // Wrapper to update both local state and shared service
    const updateRecords = (newRecords: VacationRecord[]) => {
        setVacationRecordsLocal(newRecords);
        setTimeOffRecords(newRecords);
    };

    // Filter records based on selected filters
    const filteredRecords = vacationRecords.filter(record => {
        const staffMatch = !staffFilter || record.userId === staffFilter;
        const typeMatch = typeFilter === 'all' || record.type === typeFilter;
        return staffMatch && typeMatch;
    });

    // Sort by start date (most recent first)
    const sortedRecords = [...filteredRecords].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const handleOpenAddModal = () => {
        setFormData(INITIAL_FORM_DATA);
        setEditingRecord(null);
        setShowAddModal(true);
    };

    const handleOpenEditModal = (record: VacationRecord) => {
        setFormData({
            userId: record.userId,
            type: record.type,
            startDate: record.startDate,
            endDate: record.endDate,
            notes: record.notes || '',
        });
        setEditingRecord(record);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setFormData(INITIAL_FORM_DATA);
        setEditingRecord(null);
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.userId) {
            showWarning('Please select a staff member');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            showWarning('Please select start and end dates');
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            showWarning('End date must be after start date');
            return;
        }

        const selectedMember = MOCK_TEAM_MEMBERS.find(m => m.id === formData.userId);
        if (!selectedMember) {
            showError('Invalid staff member selected');
            return;
        }

        if (editingRecord) {
            // Update existing record
            const updatedRecords = vacationRecords.map(record =>
                record.id === editingRecord.id
                    ? {
                        ...record,
                        userId: formData.userId,
                        userName: selectedMember.name,
                        type: formData.type,
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        notes: formData.notes || undefined,
                    }
                    : record
            );
            updateRecords(updatedRecords);
            showSuccess('Time off record updated successfully');
        } else {
            // Create new record
            const newRecord: VacationRecord = {
                id: `${Date.now()}`,
                userId: formData.userId,
                userName: selectedMember.name,
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                notes: formData.notes || undefined,
                status: 'approved',
                createdAt: new Date().toISOString(),
                createdBy: 'Admin', // TODO: Get from session
            };
            updateRecords([...vacationRecords, newRecord]);
            showSuccess('Time off record added successfully');
        }

        handleCloseModal();
    };

    const handleDelete = (record: VacationRecord) => {
        if (window.confirm(`Are you sure you want to delete the ${VACATION_TYPES[record.type].label.toLowerCase()} for ${record.userName}?`)) {
            updateRecords(vacationRecords.filter(r => r.id !== record.id));
            showSuccess('Time off record deleted');
        }
    };

    const calculateDays = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const formatDateRange = (startDate: string, endDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (startDate === endDate) {
            return formatShortDate(start);
        }
        return `${formatShortDate(start)} - ${formatShortDate(end)}`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Staff Time Off</h2>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Manage staff vacations and special days off
                        </p>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Time Off
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-wrap gap-3">
                    {/* Staff Filter */}
                    <select
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Staff</option>
                        {MOCK_TEAM_MEMBERS.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as VacationType | 'all')}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        {Object.entries(VACATION_TYPES).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Vacation Records List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Time Off Records</h3>
                </div>

                {sortedRecords.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-2">📅</div>
                        <div className="text-gray-500">No time off records found</div>
                        <button
                            onClick={handleOpenAddModal}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            Add first time off record
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sortedRecords.map(record => {
                            const typeInfo = VACATION_TYPES[record.type];
                            const days = calculateDays(record.startDate, record.endDate);

                            return (
                                <div key={record.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                                                <span>{typeInfo.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-gray-900">{record.userName}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                        {typeInfo.label}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {formatDateRange(record.startDate, record.endDate)}
                                                    <span className="text-gray-400 mx-1">•</span>
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </div>
                                                {record.notes && (
                                                    <div className="text-xs text-gray-500 mt-1">{record.notes}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-13 md:ml-0">
                                            <button
                                                onClick={() => handleOpenEditModal(record)}
                                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingRecord ? 'Edit Time Off' : 'Add Time Off'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Staff Member */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Staff Member *
                                    </label>
                                    <select
                                        value={formData.userId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select staff member...</option>
                                        {MOCK_TEAM_MEMBERS.map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VacationType }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(VACATION_TYPES).map(([key, { label, icon }]) => (
                                            <option key={key} value={key}>{icon} {label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                            min={formData.startDate}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Days Preview */}
                                {formData.startDate && formData.endDate && (
                                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                                        Total: {calculateDays(formData.startDate, formData.endDate)} day(s)
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Optional notes..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    {editingRecord ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VacationTab;
