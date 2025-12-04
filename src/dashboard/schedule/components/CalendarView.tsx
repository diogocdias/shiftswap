import { SHIFT_LEGENDS } from "../ShiftConstants.ts";
import { ShiftData } from "../Types.ts";

interface CalendarViewProps {
    getDaysInMonth: () => (Date | null)[];
    monthShifts: ShiftData;
    LOGGED_IN_USER_ID: string;
    isToday: (d: Date | null) => boolean;
    setSelectedDate: (d: Date | null) => void;
}

export default function CalendarView(props: CalendarViewProps) {
    const { getDaysInMonth, monthShifts, LOGGED_IN_USER_ID, isToday, setSelectedDate } = props;

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
                    const dayShifts = dateKey
                        ? monthShifts[LOGGED_IN_USER_ID]?.[dateKey] || []
                        : [];
                    const today = isToday(date);

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] border-b border-r p-2 ${
                                !date ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                            } ${today ? "bg-blue-50" : ""} transition cursor-pointer`}
                            onClick={() => date && setSelectedDate(date)}
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
