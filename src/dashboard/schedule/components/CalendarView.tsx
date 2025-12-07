import { SHIFT_LEGENDS } from "../ShiftConstants.ts";
import { ShiftData } from "../Types.ts";
import { VacationRecord } from "../../../types/domain";
import { TIME_OFF_TYPES } from "../../../services/timeOffService";

interface CalendarViewProps {
    getDaysInMonth: () => (Date | null)[];
    monthShifts: ShiftData;
    LOGGED_IN_USER_ID: string;
    isToday: (d: Date | null) => boolean;
    setSelectedDate: (d: Date | null) => void;
    getTimeOffForDate?: (userId: string, dateString: string) => VacationRecord | undefined;
}

export default function CalendarView(props: CalendarViewProps) {
    const { getDaysInMonth, monthShifts, LOGGED_IN_USER_ID, isToday, setSelectedDate, getTimeOffForDate } = props;

    const days = getDaysInMonth();

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                        key={d}
                        className="px-2 py-3 text-center text-xs font-semibold text-gray-700"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
                {days.map((date, index) => {
                    const dateKey = date?.toISOString().split("T")[0];
                    const timeOff = dateKey ? getTimeOffForDate?.(LOGGED_IN_USER_ID, dateKey) : undefined;
                    const dayShifts = dateKey
                        ? monthShifts[LOGGED_IN_USER_ID]?.[dateKey] || []
                        : [];
                    const today = isToday(date);

                    // If on time off, show grayed out cell (not clickable)
                    if (date && timeOff) {
                        const typeInfo = TIME_OFF_TYPES[timeOff.type];
                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] border-b border-r p-2 bg-gray-100 ${today ? "ring-2 ring-inset ring-blue-400" : ""} transition`}
                            >
                                <div
                                    className={`text-xs font-medium mb-1 ${
                                        today ? "text-blue-600 font-bold" : "text-gray-500"
                                    }`}
                                >
                                    {today ? (
                                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                                            Today
                                        </span>
                                    ) : (
                                        date.getDate()
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div
                                        className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 opacity-75"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                        {typeInfo.shortLabel}
                                    </div>
                                    {timeOff.notes && (
                                        <div className="text-[9px] text-gray-500 truncate">
                                            {timeOff.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Check if day has any working shifts (M, A, N)
                    const hasWorkingShift = dayShifts.some(shift => ['M', 'A', 'N'].includes(shift));
                    const isClickable = date && hasWorkingShift;

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] border-b border-r p-2 ${
                                !date ? "bg-gray-50" : isClickable ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-white"
                            } ${today ? "bg-blue-50" : ""} transition`}
                            onClick={() => isClickable && setSelectedDate(date)}
                        >
                            {date && (
                                <>
                                    <div
                                        className={`text-xs font-medium mb-1 ${
                                            today ? "text-blue-600 font-bold" : "text-gray-900"
                                        }`}
                                    >
                                        {today ? (
                                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                                                Today
                                            </span>
                                        ) : (
                                            date.getDate()
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        {dayShifts.map((shift, idx) => {
                                            const shiftInfo = SHIFT_LEGENDS[shift];

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`${shiftInfo.color} px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1`}
                                                >
                                                    <div
                                                        className={`w-1.5 h-1.5 rounded-full ${shiftInfo.dotColor}`}
                                                    ></div>
                                                    {shiftInfo.shorthand}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
