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
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-y-auto">
      <div
        ref={tableRef}
        className="w-full max-w-[1200px] p-10 bg-[#0e0f1a] rounded-lg shadow-lg"
      >
        <h2 className="text-4xl font-bold text-white mb-4 text-center">
          {username}'s Schedule
        </h2>
        <p className="text-2xl text-white mb-6 text-center">
          GPA: {gpa.toFixed(2)}
        </p>

        {/* Download button */}
        <div className="mb-4 text-center">
          <button
            onClick={handleDownloadImage}
            className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-5 rounded transition-colors"
          >
            Download Lecture Table
          </button>
        </div>

        {/* Lecture Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-white border border-gray-700"></th> {/* Empty corner cell */}
                {periods.map((period) => (
                  <th
                    key={period.time}
                    className="p-4 text-white text-center font-bold text-xl border border-gray-700 min-w-[150px]"
                  >
                    {period.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="p-4 text-white text-center font-bold text-xl border border-gray-700">
                    {day}
                  </td>
                  {periods.map((_, periodIndex) => (
                    <td
                      key={periodIndex}
                      className="p-6 text-white text-center bg-[#333845] border border-gray-700 min-w-[150px]"
                    >
                      Period {periodIndex + 1}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LectureTable;
