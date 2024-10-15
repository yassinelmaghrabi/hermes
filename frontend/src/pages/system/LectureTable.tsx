import React, { useRef } from "react";
import html2canvas from "html2canvas";

interface LectureTableProps {
  username: string;
  gpa: number;
}

const LectureTable: React.FC<LectureTableProps> = ({ username, gpa }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const periods = [
    { time: "8:30-10:30" },
    { time: "10:30-12:30" },
    { time: "12:30-2:30" },
    { time: "2:30-4:30" },
    { time: "4:30-6:30" },
    { time: "6:30-8:30" },
  ];

  const days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const handleDownloadImage = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current, { useCORS: true }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "lecture_table.png";
        link.click();
      });
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center">
      <div
        ref={tableRef}
        className="w-full max-w-[1200px] p-12 bg-[#0e0f1a] rounded-lg shadow-lg"
      >
        <h2 className="text-4xl font-bold text-white mb-4 text-center">
          {username}'s Schedule
        </h2>
        <p className="text-2xl text-white mb-8 text-center">
          GPA: {gpa.toFixed(2)}
        </p>

        {/* Download button */}
        <div className="mb-4 text-center">
          <button
            onClick={handleDownloadImage}
            className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded transition-colors"
          >
            Download Lecture Table
          </button>
        </div>

        {/* Lecture table */}
        <div className="grid grid-cols-7 gap-6 mb-8">
          {/* First empty cell for top-left corner */}
          <div></div>
          {/* Time periods in the top row */}
          {periods.map((period) => (
            <div
              key={period.time}
              className="text-white text-center font-bold text-xl"
            >
              {period.time}
            </div>
          ))}
        </div>

        {/* Days in the first column and lecture periods in the other cells */}
        {days.map((day) => (
          <div key={day} className="grid grid-cols-7 gap-6 mb-4">
            {/* Day label in the first column */}
            <div className="text-white text-center font-bold text-xl">
              {day}
            </div>

            {/* Period cells */}
            {periods.map((_, periodIndex) => (
              <div
                key={periodIndex}
                className="bg-[#333845] text-white p-6 text-lg rounded-md flex items-center justify-center"
              >
                Period {periodIndex + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureTable;
