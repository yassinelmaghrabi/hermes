import React, { useState } from 'react';
import { PlusCircle, Book, User, Info, Search, Bell, Settings, Edit2, Trash } from 'lucide-react';
import './CourseManagement.css';

interface Course {
  ID: string;
  Name: string;
  Description: string;
  Instructors: string[];
}

interface Section {
  id: string;
  name: string;
  description: string;
  code: string;
  capacity: number;
  enrolled: number;
  room: string;
}

const mockCourses: Course[] = [
  { ID: '1', Name: 'Introduction to React', Description: 'Learn the basics of React.', Instructors: ['Alice'] },
  { ID: '2', Name: 'Advanced JavaScript', Description: 'Deep dive into JavaScript concepts.', Instructors: ['Bob'] },
];

const mockSections: Section[] = [
  { id: '1', name: 'Section A', description: 'Introduction to React - Section A', code: 'CS101', capacity: 30, enrolled: 25, room: 'Room 101' },
  { id: '2', name: 'Section B', description: 'Introduction to React - Section B', code: 'CS101', capacity: 30, enrolled: 20, room: 'Room 102' },
];

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [newCourse, setNewCourse] = useState({ Name: '', Description: '', Instructors: [''] });
  const [newSection, setNewSection] = useState({ name: '', description: '', code: '', capacity: 0, enrolled: 0, room: '' });
  const [error, setError] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isViewingSections, setIsViewingSections] = useState(false);

  const handleAddCourse = () => {
    if (!newCourse.Name || !newCourse.Description) {
      setError('Name and Description are required');
      return;
    }
    
    const newCourseData = { ID: Date.now().toString(), ...newCourse };
    setCourses([...courses, newCourseData]);
    setNewCourse({ Name: '', Description: '', Instructors: [''] });
    setIsAddingCourse(false);
    setError('');
  };

  const handleAddSection = () => {
    if (!newSection.name || !newSection.code || newSection.capacity <= 0) {
      setError('Name, Code, and Capacity are required');
      return;
    }

    const newSectionData = { id: Date.now().toString(), ...newSection };
    setSections([...sections, newSectionData]);
    setNewSection({ name: '', description: '', code: '', capacity: 0, enrolled: 0, room: '' });
    setIsAddingSection(false);
    setError('');
  };

  const handleEditCourse = () => {
    if (!editingCourse) return;

    setCourses(courses.map(c => (c.ID === editingCourse.ID ? editingCourse : c)));
    setEditingCourse(null);
  };

  const handleEditSection = () => {
    if (!editingSection) return;

    setSections(sections.map(s => (s.id === editingSection.id ? editingSection : s)));
    setEditingSection(null);
  };

  const handleDeleteCourse = (ID: string) => {
    setCourses(courses.filter(course => course.ID !== ID));
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const filteredCourses = courses.filter(course =>
    course.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo-container">
          <img src="flux-image.png" alt="Hermes Logo" className="logo-image" />
          <h1 className="app-title">Hermes</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>
          <ul className="nav-list">
            <li className={`nav-item ${!isViewingSections ? 'active' : ''}`} onClick={() => setIsViewingSections(false)}>
              <Book className="nav-icon" /><span>Courses</span>
            </li>
            <li className={`nav-item ${isViewingSections ? 'active' : ''}`} onClick={() => setIsViewingSections(true)}>
              <User className="nav-icon" /><span>Sections</span>
            </li>
            {/* <li className="nav-item"><Info className="nav-icon" /><span>About</span></li> */}
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="header-actions">
            <button className="icon-button"><Bell /></button>
            <button className="icon-button"><Settings /></button>
            <div className="user-avatar"><img src="user.png" alt="User" /></div>
          </div>
        </div>

        <div className="section-content">
          {isViewingSections ? (
            <div className="section-header">
              <h2>Sections</h2>
              <button className="add-button" onClick={() => setIsAddingSection(true)}>
                <PlusCircle /> Add Section
              </button>
            </div>
          ) : (
            <div className="section-header">
              <h2>Courses</h2>
              <button className="add-button" onClick={() => setIsAddingCourse(true)}>
                <PlusCircle /> Add Course
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {isViewingSections ? (
            <div className="section-grid">
              {sections.map((section) => (
                <div key={section.id} className="section-card">
                  <div className="section-card-content">
                    <h3>Name: <span className='content1'>{section.name}</span></h3>
                    <p>Discription: <span className='content1'>{section.description}</span></p>
                    <div>Code: <span className='content1'>{section.code}</span></div>
                    <div>Room: <span className='content1'>{section.room}</span></div>
                    <div>Capacity: <span className='content1'>{section.capacity}</span></div>
                    <div>Enrolled: <span className='content1'>{section.enrolled}</span></div>
                  </div>
                  <div className="card-actions">
                    <button className="icon-button" onClick={() => setEditingSection(section)}><Edit2 /></button>
                    <button className="icon-button" onClick={() => handleDeleteSection(section.id)}><Trash /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="course-grid">
              {filteredCourses.map((course) => (
                <div key={course.ID} className="course-card">
                  <div className="course-card-content">
                    <h3>Name: <span className='content1'>{course.Name}</span></h3>
                    <p>Discription: <span className='content1'>{course.Description}</span></p>
                    <div className="instructors content1"><span className='inst'>Instructors:</span> {course.Instructors.join(', ')}</div>
                  </div>
                  <div className="card-actions">
                    <button className="icon-button" onClick={() => setEditingCourse(course)}><Edit2 /></button>
                    <button className="icon-button" onClick={() => handleDeleteCourse(course.ID)}><Trash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Course Modal */}
        {isAddingCourse && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add Course</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddCourse();
              }}>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={newCourse.Name}
                  onChange={(e) => setNewCourse({ ...newCourse, Name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Course Description"
                  value={newCourse.Description}
                  onChange={(e) => setNewCourse({ ...newCourse, Description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Instructor"
                  value={newCourse.Instructors[0]}
                  onChange={(e) => setNewCourse({ ...newCourse, Instructors: [e.target.value] })}
                />
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Add Course</button>
                  <button type="button" className="cancel-button" onClick={() => setIsAddingCourse(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Section Modal */}
        {isAddingSection && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add Section</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddSection();
              }}>
                <input
                  type="text"
                  placeholder="Section Name"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Section Description"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Section Code"
                  value={newSection.code}
                  onChange={(e) => setNewSection({ ...newSection, code: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newSection.capacity}
                  onChange={(e) => setNewSection({ ...newSection, capacity: +e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Enrolled"
                  value={newSection.enrolled}
                  onChange={(e) => setNewSection({ ...newSection, enrolled: +e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Room"
                  value={newSection.room}
                  onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
                />
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Add Section</button>
                  <button type="button" className="cancel-button" onClick={() => setIsAddingSection(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Course</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditCourse();
              }}>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={editingCourse.Name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, Name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Course Description"
                  value={editingCourse.Description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, Description: e.target.value })}
                />
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Update Course</button>
                  <button type="button" className="cancel-button" onClick={() => setEditingCourse(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Section Modal */}
        {editingSection && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Section</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditSection();
              }}>
                <input
                  type="text"
                  placeholder="Section Name"
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Section Description"
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Section Code"
                  value={editingSection.code}
                  onChange={(e) => setEditingSection({ ...editingSection, code: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={editingSection.capacity}
                  onChange={(e) => setEditingSection({ ...editingSection, capacity: +e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Enrolled"
                  value={editingSection.enrolled}
                  onChange={(e) => setEditingSection({ ...editingSection, enrolled: +e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Room"
                  value={editingSection.room}
                  onChange={(e) => setEditingSection({ ...editingSection, room: e.target.value })}
                />
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Update Section</button>
                  <button type="button" className="cancel-button" onClick={() => setEditingSection(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
