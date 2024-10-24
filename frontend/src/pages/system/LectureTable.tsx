import React, { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import axios from "axios";
import { Calendar, Clock, Users, MapPin, Download, Loader2, Book, AlertCircle, ChevronRight } from "lucide-react";
import './lecture-schedule-styles.css';

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
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [showDayView, setShowDayView] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);
  const userID = localStorage.getItem('userId');

  const periods = [
    { time: "8:30-10:30", label: "Period 1" },
    { time: "10:30-12:30", label: "Period 2" },
    { time: "12:30-2:30", label: "Period 3" },
    { time: "2:30-4:30", label: "Period 4" },
    { time: "4:30-6:30", label: "Period 5" },
    { time: "6:30-8:30", label: "Period 6" },
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

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setShowDayView(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  };

  const handleDownloadImage = async () => {
    if (tableRef.current) {
      try {
        const button = document.querySelector('.download-button');
        if (button) button.classList.add('hidden');
        
        const canvas = await html2canvas(tableRef.current, { 
          useCORS: true,
          backgroundColor: '#0e0f1a'
        });
        
        if (button) button.classList.remove('hidden');
        
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${username}_schedule.png`;
        link.click();
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
  };

  const getLectureForSlot = (dayIndex: number, slotIndex: number) => {
    return lectures.find(
      (lecture) => lecture.Date.Day === dayIndex && lecture.Date.Slot === slotIndex
    );
  };

  const getLecturesForDay = (dayIndex: number) => {
    return lectures.filter((lecture) => lecture.Date.Day === dayIndex)
      .sort((a, b) => a.Date.Slot - b.Date.Slot);
  };

  const renderLectureCard = (lecture: Lecture) => {
    const startTime = periods[lecture.Date.Slot].time.split("-")[0];
    const endTime = periods[lecture.Date.Slot].time.split("-")[1];

    return (
      <div key={lecture.ID} className="lecture-card">
        <div className="lecture-card-header">
          <span className="lecture-code">{lecture.Code}</span>
          <span className="lecture-time">{startTime} - {endTime}</span>
        </div>
        <h3 className="lecture-title">{lecture.Name}</h3>
        <div className="lecture-details">
          <div className="lecture-instructor">
            <Users className="w-4 h-4 mr-1" />
            {lecture.Instructors || "No instructor"}
          </div>
          <div className="lecture-location">
            <MapPin className="w-4 h-4 mr-1" />
            {lecture.Hall}
          </div>
        </div>
        <div className="lecture-description">
          {lecture.Description || "No description available"}
        </div>
        <div className="lecture-status">
          <span className="enrollment-count">
            {lecture.Enrolled}/{lecture.Capacity} Students
          </span>
          {lecture.Enrolled >= lecture.Capacity && (
            <span className="full-capacity">
              <AlertCircle className="w-4 h-4 mr-1" />
              Full Capacity
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
        <div className="text-white text-2xl">Loading your schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <AlertCircle className="w-6 h-6" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="schedule-wrapper">
        <div className="header-container">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="title">{username}'s Schedule</h1>
              <div className="gpa-badge">
                <span className="gpa-text">GPA: {gpa.toFixed(2)}</span>
              </div>
            </div>
            <div className="enrolled-courses">
              <Book className="w-5 h-5" />
              <span>{lectures.length} Enrolled Courses</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDayView(false)}
              className={`button ${!showDayView ? 'button-primary' : 'button-secondary'}`}
            >
              Week View
            </button>
            <button
              onClick={handleDownloadImage}
              className="button button-primary download-button"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>

        {!showDayView ? (
          <div ref={tableRef} className="schedule-table-container">
            <div className="table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr className="table-header">
                    <th></th>
                    {periods.map((period) => (
                      <th key={period.time}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="period-label">{period.label}</span>
                          <div className="period-time">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>{period.time}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dayIndex) => (
                    <tr key={day} className="day-row" onClick={() => handleDayClick(dayIndex)}>
                      <td className="day-cell">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>{day}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </td>
                      {periods.map((_, periodIndex) => {
                        const lecture = getLectureForSlot(dayIndex, periodIndex);
                        return (
                          <td
                            key={periodIndex}
                            className={`lecture-cell ${lecture ? 'has-lecture' : ''}`}
                          >
                            {lecture && (
                              <div className="flex flex-col gap-1">
                                <span className="lecture-code">
                                  {lecture.Code}
                                </span>
                                <span className="text-sm">{lecture.Name}</span>
                                <span className="text-xs text-gray-300">
                                  {lecture.Hall}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`day-view-container ${animating ? 'animate-fadeIn' : ''}`}>
            <div className="day-view-header">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                {days[selectedDay]}
              </h2>
              <div className="day-tabs">
                {days.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index)}
                    className={`day-tab ${selectedDay === index ? 'active' : ''}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {getLecturesForDay(selectedDay).length > 0 ? (
                getLecturesForDay(selectedDay).map(lecture => renderLectureCard(lecture))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No lectures scheduled for this day
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureTable;