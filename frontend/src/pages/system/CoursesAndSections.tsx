import React, { useState, useEffect } from 'react';
import { PlusCircle, Book, User, Search, Bell, Settings, Edit2, Trash } from 'lucide-react';
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

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [newCourse, setNewCourse] = useState({ Name: '', Description: '', Instructors: [''] });
  const [newSection, setNewSection] = useState({ name: '', description: '', code: '', capacity: 0, enrolled: 0, room: '' });
  const [error, setError] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isViewingSections, setIsViewingSections] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchSections();
  }, []);

  const fetchCourses = async () => {
    const response = await fetch('/api/courses', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setCourses(data);
  };

  const fetchSections = async () => {
    const response = await fetch('/api/sections', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setSections(data);
  };

  const handleAddCourse = async () => {
    if (!newCourse.Name || !newCourse.Description) {
      setError('Name and Description are required');
      return;
    }

    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(newCourse),
    });

    if (response.ok) {
      fetchCourses();
      setNewCourse({ Name: '', Description: '', Instructors: [''] });
      setIsAddingCourse(false);
      setError('');
    }
  };

  const handleAddSection = async () => {
    if (!newSection.name || !newSection.code || newSection.capacity <= 0) {
      setError('Name, Code, and Capacity are required');
      return;
    }

    const response = await fetch('/api/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(newSection),
    });

    if (response.ok) {
      fetchSections();
      setNewSection({ name: '', description: '', code: '', capacity: 0, enrolled: 0, room: '' });
      setIsAddingSection(false);
      setError('');
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    const response = await fetch(`/api/courses/${editingCourse.ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(editingCourse),
    });

    if (response.ok) {
      fetchCourses();
      setEditingCourse(null);
    }
  };

  const handleEditSection = async () => {
    if (!editingSection) return;

    const response = await fetch(`/api/sections/${editingSection.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(editingSection),
    });

    if (response.ok) {
      fetchSections();
      setEditingSection(null);
    }
  };

  const handleDeleteCourse = async (ID: string) => {
    await fetch(`/api/courses/${ID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    fetchCourses();
  };

  const handleDeleteSection = async (id: string) => {
    await fetch(`/api/sections/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    fetchSections();
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
                    <p>Description: <span className='content1'>{section.description}</span></p>
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
                    <p>Description: <span className='content1'>{course.Description}</span></p>
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

        {isAddingCourse && (
          <div className="modal">
            <h2>Add Course</h2>
            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.Name}
              onChange={(e) => setNewCourse({ ...newCourse, Name: e.target.value })}
            />
            <textarea
              placeholder="Course Description"
              value={newCourse.Description}
              onChange={(e) => setNewCourse({ ...newCourse, Description: e.target.value })}
            />
            <button onClick={handleAddCourse}>Add Course</button>
            <button onClick={() => setIsAddingCourse(false)}>Cancel</button>
          </div>
        )}

        {isAddingSection && (
          <div className="modal">
            <h2>Add Section</h2>
            <input
              type="text"
              placeholder="Section Name"
              value={newSection.name}
              onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
            />
            <textarea
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
              onChange={(e) => setNewSection({ ...newSection, capacity: Number(e.target.value) })}
            />
            <input
              type="text"
              placeholder="Room"
              value={newSection.room}
              onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
            />
            <button onClick={handleAddSection}>Add Section</button>
            <button onClick={() => setIsAddingSection(false)}>Cancel</button>
          </div>
        )}

        {editingCourse && (
          <div className="modal">
            <h2>Edit Course</h2>
            <input
              type="text"
              placeholder="Course Name"
              value={editingCourse.Name}
              onChange={(e) => setEditingCourse({ ...editingCourse, Name: e.target.value })}
            />
            <textarea
              placeholder="Course Description"
              value={editingCourse.Description}
              onChange={(e) => setEditingCourse({ ...editingCourse, Description: e.target.value })}
            />
            <button onClick={handleEditCourse}>Save Changes</button>
            <button onClick={() => setEditingCourse(null)}>Cancel</button>
          </div>
        )}

        {editingSection && (
          <div className="modal">
            <h2>Edit Section</h2>
            <input
              type="text"
              placeholder="Section Name"
              value={editingSection.name}
              onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
            />
            <textarea
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
              onChange={(e) => setEditingSection({ ...editingSection, capacity: Number(e.target.value) })}
            />
            <input
              type="text"
              placeholder="Room"
              value={editingSection.room}
              onChange={(e) => setEditingSection({ ...editingSection, room: e.target.value })}
            />
            <button onClick={handleEditSection}>Save Changes</button>
            <button onClick={() => setEditingSection(null)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
