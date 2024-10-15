import React, { useState } from "react";
import dayjs from "dayjs";

interface Event {
  date: string;
  description: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events] = useState<Event[]>([
    { date: dayjs().date(5).format("YYYY-MM-DD"), description: "Assignment 1" },
    { date: dayjs().date(12).format("YYYY-MM-DD"), description: "Event Day" },
  ]);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();
  const today = dayjs().format("YYYY-MM-DD");

  const isEventDay = (date: string) => {
    return events.some((event) => event.date === date);
  };

  const getEventDescription = (date: string) => {
    const event = events.find((event) => event.date === date);
    return event ? event.description : null;
  };

  const renderDays = () => {
    const daysArray = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<div key={`empty-${i}`} className="empty-cell"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = currentDate.date(day).format("YYYY-MM-DD");
      const isToday = currentDay === today;
      const hasEvent = isEventDay(currentDay);
      const eventDescription = getEventDescription(currentDay);

      daysArray.push(
        <div
          key={day}
          onMouseEnter={() => hasEvent && setHoveredDay(currentDay)}
          onMouseLeave={() => setHoveredDay(null)}
          className={`relative day-cell ${
            isToday ? "bg-green-500" : hasEvent ? "bg-red-500" : "bg-[#333845]"
          } text-white p-6 flex items-center justify-center rounded-md`}
        >
          {day}
          {hasEvent && hoveredDay === currentDay && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded shadow-lg text-sm z-10">
              {eventDescription}
            </div>
          )}
        </div>
      );
    }

    return daysArray;
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[900px] p-8 bg-[#0e0f1a] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Calendar
        </h2>

        <div className="flex justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="text-white bg-transparent border border-white py-2 px-4 rounded hover:bg-white hover:text-black transition-colors"
          >
            Previous
          </button>
          <h3 className="text-xl font-semibold text-white">
            {currentDate.format("MMMM YYYY")}
          </h3>
          <button
            onClick={handleNextMonth}
            className="text-white bg-transparent border border-white py-2 px-4 rounded hover:bg-white hover:text-black transition-colors"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-white text-center font-bold">
              {day}
            </div>
          ))}

          {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
