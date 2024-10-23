import React, { useState } from "react";
import './GpaCalculator.css'

interface Course {
  courseName: string;
  creditHours: number;
  grade: string; 
}

interface Semester {
  name: string;
  courses: Course[];
}

const gradePoints: { [key: string]: number } = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

const GpaCalculator: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [newCourse, setNewCourse] = useState<Course>({
    courseName: "",
    creditHours: 0,
    grade: "",
  });
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Add new semester
  const addSemester = () => {
    if (newSemesterName) {
      setSemesters([...semesters, { name: newSemesterName, courses: [] }]);
      setNewSemesterName("");
    }
  };

  
  const addCourseToSemester = () => {
    if (!selectedSemester) return;

    const updatedSemesters = semesters.map((semester) => {
      if (semester.name === selectedSemester) {
        return {
          ...semester,
          courses: [...semester.courses, newCourse],
        };
      }
      return semester;
    });

    setSemesters(updatedSemesters);
    setNewCourse({ courseName: "", creditHours: 0, grade: "" });
  };

  // Calculate GPA for a semester
  const calculateGPA = (semester: Semester) => {
    let totalPoints = 0;
    let totalCreditHours = 0;

    semester.courses.forEach((course) => {
      const gradePoint = gradePoints[course.grade];
      totalPoints += gradePoint * course.creditHours;
      totalCreditHours += course.creditHours;
    });

    return totalCreditHours > 0 ? (totalPoints / totalCreditHours).toFixed(2) : "N/A";
  };

  return (
    <div className="gpaContainer">
        <div className="p-6 text-white rounded-lg shadow-lg gpa-container" >
      <h2 className="text-3xl font-bold mb-6 text-white-600 head-gpa">GPA Calculator</h2>

      {/* Add Semester */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Add Semester Name"
          className="p-2 w-full mb-4 border border-gray-600 rounded-lg bg-gray-800 text-white"
          value={newSemesterName}
          onChange={(e) => setNewSemesterName(e.target.value)}
        />
        <button
          onClick={addSemester}
          className="w-full p-2 bg-purple-700 hover:bg-purple-800 rounded-lg text-white transition"
        >
          Add Semester
        </button>
      </div>

      {/* Select Semester to add course */}
      <div className="mb-6">
        <label className="block text-lg mb-2">Select Semester:</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="p-2 w-full border border-gray-600 rounded-lg bg-gray-800 text-white"
        >
          <option value="">--Select Semester--</option>
          {semesters.map((semester, index) => (
            <option key={index} value={semester.name}>
              {semester.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Course */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Course Name"
          className="p-2 w-full mb-4 border border-gray-600 rounded-lg bg-gray-800 text-white"
          value={newCourse.courseName}
          onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
        />
        <input
          type="number"
          placeholder="Credit Hours"
          className="p-2 w-full mb-4 border border-gray-600 rounded-lg bg-gray-800 text-white"
          value={newCourse.creditHours}
          onChange={(e) => setNewCourse({ ...newCourse, creditHours: parseFloat(e.target.value) })}
        />
        <select
          value={newCourse.grade}
          onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
          className="p-2 w-full border border-gray-600 rounded-lg bg-gray-800 text-white"
        >
          <option value="">--Select Grade--</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
        <button
          onClick={addCourseToSemester}
          className="w-full mt-4 p-2 bg-purple-700 hover:bg-purple-800 rounded-lg text-white transition"
        >
          Add Course
        </button>
      </div>

      {/* List Semesters and GPA */}
      {semesters.map((semester, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold text-white-500 mb-2">{semester.name}</h3>
          <ul className="bg-gray-800 p-4 rounded-lg mb-4">
            {semester.courses.map((course, idx) => (
              <li key={idx} className="mb-2">
                <strong>{course.courseName}</strong> - {course.creditHours} Hours - Grade: {course.grade}
              </li>
            ))}
          </ul>
          <p>
            <strong className="text-white-500">GPA:</strong> {calculateGPA(semester)}
          </p>
        </div>
      ))}
    </div>
    </div>
    
  );
};

export default GpaCalculator;
