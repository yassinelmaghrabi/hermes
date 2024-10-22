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
  Users: string[]; // Assuming this contains the IDs of enrolled users
  Course: string;
}

const API_BASE_URL = "https://hermes-1.onrender.com/api";

const EnrollPage: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.get(`${API_BASE_URL}/lecture/getall`, {
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
    const userID = '671316fcb289837e9018ad37'; // Assuming userID is stored in local storage

    console.log("Enrolling user ID:", userID);
    console.log("Enrolling in lecture ID:", lectureID);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/lecture/enroll?lecture_id=${lectureID}`,
        { userID }, // Sending the user ID in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Enrollment response:", response.data);
      fetchLectures(); // Refresh lectures after enrollment
    } catch (error) {
      console.error("Error enrolling in lecture:", error.response?.data);
      setError(`Error enrolling in lecture: ${error.response?.data.error}`);
    }
  };

  const deleteLecture = async (lectureID: string) => {
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/lecture/delete?id=${lectureID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Delete response:", response.data);
      fetchLectures(); // Refresh lectures after deletion
    } catch (error) {
      console.error("Error deleting lecture:", error.response?.data);
      setError(`Error deleting lecture: ${error.response?.data.error}`);
    }
  };

  const getTimeSlot = (slot: number): string => {
    const timeSlots: { [key: number]: string } = {
      0: "08:30-10:30",
      1: "10:30-12:30",
      2: "12:30-14:30",
      3: "14:30-16:30",
      4: "16:30-18:30",
    };
    return timeSlots[slot] || "None";
  };

  const getDay = (day: number): string => {
    const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    return days[day] || "None";
  };

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

  const userID = '671316fcb289837e9018ad37'; // Replace with dynamic user ID from localStorage if needed

  return (
    <div className="container111">
      {lectures.map((lecture) => (
        <div key={lecture.ID} className={lecture.Enrolled >= lecture.Capacity ? "enroll-details1" : "enroll-details"}>
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
              <div>L: {getDay(lecture.Date.Day)}</div>
              <div className="blue">{getTimeSlot(lecture.Date.Slot)}</div>
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
              {/* Check if the lecture is closed */}
              {lecture.Enrolled >= lecture.Capacity ? (
                <div className="closed-message">Closed 🖕</div>
              ) : (
                <>
                  {/* Check if the user is already enrolled */}
                  {!lecture.Users.includes(userID) ? (
                    <button
                      className="add-button1"
                      onClick={() => enrollInLecture(lecture.ID)}
                    >
                      Add Course
                    </button>
                  ) : (
                    <div className="enrolled-message">Already Enrolled</div>
                  )}
                  <button
                    className="delete-button"
                    onClick={() => deleteLecture(lecture.ID)}
                  >
                    Delete Course
                  </button>
                  {/* <button className="withdraw-button">Withdraw</button> */}
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
