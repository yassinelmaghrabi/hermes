import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EnrollPage.css";

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

const API_BASE_URL = "https://hermes-1.onrender.com/api";

const EnrollPage: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [enrolledLectures, setEnrolledLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const userID: string | null = localStorage.getItem('userId');

  const periods = [
    "08:30-10:30",
    "10:30-12:30",
    "12:30-14:30",
    "14:30-16:30",
    "16:30-18:30",
  ];

  const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  useEffect(() => {
    fetchLectures();
  }, []);

  useEffect(() => {
    const userEnrolled = lectures.filter((lecture) =>
      lecture.Users.includes(userID!)
    );
    setEnrolledLectures(userEnrolled);
  }, [lectures, userID]);

  const fetchLectures = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.get(`${API_BASE_URL}/lectures/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLectures(response.data.lectures);
      setError("");
    } catch (error) {
      console.error("Error fetching lectures:", error);
      setError("Failed to fetch lectures. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInLecture = async (lectureID: string) => {
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      await axios.post(
        `${API_BASE_URL}/lectures/enroll?lecture_id=${lectureID}`,
        { userID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchLectures();
    } catch (error: any) {
      setError(`Error enrolling in lecture: ${error.response?.data.error}`);
    }
  };

  const deleteLecture = async (lectureID: string) => {
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      await axios.post(`${API_BASE_URL}/lectures/unenroll`, { lectureID, userID }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLectures();
    } catch (error: any) {
      setError(`Error deleting lecture: ${error.response?.data.error}`);
    }
  };

  const filteredLectures = lectures.filter((lecture) =>
    lecture.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LectureTable = () => (
    <div className="lec-table">
      <div className="mb-8 w-full max-w-[900px] p-4 bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4 myschedule">My Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-white border border-gray-700"></th>
                {periods.map((period) => (
                  <th key={period} className="p-2 text-white text-center border border-gray-700">
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="p-2 text-white text-center border border-gray-700">
                    {day}
                  </td>
                  {periods.map((_, slotIndex) => {
                    const lecture = enrolledLectures.find(
                      (l) =>
                        l.Date.Day === dayIndex && l.Date.Slot === slotIndex
                    );

                    return (
                      <td
                        key={slotIndex}
                        className="p-2 text-white text-center border border-gray-700 min-w-[120px]"
                      >
                        {lecture ? (
                          <div className="bg-blue-900 p-1 rounded">
                            <div className="font-bold">{lecture.Code}</div>
                            <div className="text-sm">{lecture.Hall}</div>
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

  const SearchBar = () => (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search lectures by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <button
        onClick={() => setSearchQuery('')}
        className="delete-button"
      >
        Reset
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container111">
        <div className="loading-message">Loading lectures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container111">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container111">
      <SearchBar />
      <LectureTable />
      {filteredLectures.map((lecture) => (
        <div
          key={lecture.ID}
          className={lecture.Enrolled >= lecture.Capacity ? "enroll-details1" : "enroll-details"}
        >
          <div className="detail-row">
            <div className="detail-item">
              <div className="green">{lecture.Code || "None"}</div>
              <div className="blue">
                {lecture.Name}
                <br />
                {lecture.Description || "None"}
                <br />
                Level: None
              </div>
              <div className="red">Lecture - G.1</div>
              <div>Practical - None</div>
            </div>

            <div className="detail-item">
              <div>{lecture.Code || "None"}</div>
              <div className="instructor-name blue">
                {lecture.Instructors || "None"}
              </div>
            </div>

            <div className="detail-item">
              <div>Fall</div>
              <div>2024/2025</div>
              <div className="blue">2024-09-28</div>
            </div>

            <div className="detail-item">
              <div>L: {days[lecture.Date.Day]}</div>
              <div className="blue">{periods[lecture.Date.Slot]}</div>
              <div className="green">{lecture.Hall}</div>
            </div>

            <div className="detail-item">
              <div>Hours: 0.0</div>
              <div>Capacity: {lecture.Capacity}.0</div>
              <div className={lecture.Enrolled >= lecture.Capacity ? "red" : "green"}>
                {lecture.Enrolled >= lecture.Capacity ? "Closed" : "Open"}
              </div>
            </div>

            <div className="button-container">
              {lecture.Enrolled >= lecture.Capacity ? (
                <div className="closed-message">Closed 🖕</div>
              ) : (
                <>
                  {!lecture.Users.includes(userID!) ? (
                    <button
                      className="add-button1"
                      onClick={() => enrollInLecture(lecture.ID)}
                    >
                      Add Lecture
                    </button>
                  ) : (
                    <div className="enrolled-message">Already Enrolled</div>
                  )}
                  <button
                    className="delete-button"
                    onClick={() => deleteLecture(lecture.ID)}
                  >
                    Delete Lecture
                  </button>
                  <button className="withdraw-button">Add Section</button>
                  <button className="withdraw-button">Delete Section</button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnrollPage;
