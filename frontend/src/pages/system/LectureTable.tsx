import React, { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import axios from "axios";

interface Lecture {
  ID: string;
  Name: string;
  Description: string;
  Instructors: string;
  Code: string;
  Capacity: number;
  Enrolled: number;
  Hall: string;
  Date: {
    Slot: number;
    Day: number;
  };
  Users: string[];
}

interface LectureTableProps {
  username: string;
  gpa: number;
}

const API_BASE_URL = "https://hermes-1.onrender.com/api";

const LectureTable: React.FC<LectureTableProps> = ({ username, gpa }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const userID = localStorage.getItem('userId');

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

  useEffect(() => {
    fetchUserLectures();
  }, []);

  const fetchUserLectures = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.get(`${API_BASE_URL}/lectures/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter lectures for the current user
      const userLectures = response.data.lectures.filter((lecture: Lecture) =>
        lecture.Users.includes(userID!)
      );
      setLectures(userLectures);
      setError("");
    } catch (error) {
      console.error("Error fetching lectures:", error);
      setError("Failed to fetch lectures. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const getLectureForSlot = (dayIndex: number, slotIndex: number) => {
    return lectures.find(
      (lecture) => lecture.Date.Day === dayIndex && lecture.Date.Slot === slotIndex
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

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

        <div className="mb-4 text-center">
          <button
            onClick={handleDownloadImage}
            className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-5 rounded transition-colors"
          >
            Download Schedule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-white border border-gray-700"></th>
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
              {days.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="p-4 text-white text-center font-bold text-xl border border-gray-700">
                    {day}
                  </td>
                  {periods.map((_, periodIndex) => {
                    const lecture = getLectureForSlot(dayIndex, periodIndex);
                    return (
                      <td
                        key={periodIndex}
                        className={`p-6 text-white text-center border border-gray-700 min-w-[150px] ${
                          lecture ? 'bg-blue-900' : 'bg-[#333845]'
                        }`}
                      >
                        {lecture ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-lg">{lecture.Code}</div>
                            <div className="text-sm">{lecture.Name}</div>
                            <div className="text-xs text-gray-300">
                              {lecture.Instructors || "No instructor"}
                            </div>
                            <div className="text-xs font-semibold">
                              Hall: {lecture.Hall}
                            </div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
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