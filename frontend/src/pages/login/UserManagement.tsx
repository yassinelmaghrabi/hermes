import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Bell, Settings, User, Trash2, Edit2 } from 'lucide-react';
import './UserManagement.css';

interface ProfilePic {
  ID: string;
  Filename: string;
  Data: null | string;
}

interface User {
  ID: string;
  Username: string;
  Email: string;
  Name: string;
  Status: string;
  GPA: number;
  Hours: number;
  ProfilePic?: ProfilePic; 
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    Username: "",
    Email: "",
    Name: "",
    Password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const API_BASE_URL = "https://hermes-1.onrender.com/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.get(`${API_BASE_URL}/user/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersArray = response.data.users || [];
      setUsers(usersArray);
      setError('');
    } catch (err) {
      setError(
        "Failed to fetch users: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/user/delete?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user.ID !== id));
    } catch (err) {
      setError(
        "Failed to delete user: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_BASE_URL}/user/add`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewUser({ Username: "", Email: "", Name: "", Password: "" });
      setIsAddingUser(false);
      fetchUsers();
    } catch (err) {
      setError(
        "Failed to add user: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const token = localStorage.getItem("token");
    try {
      await axios.put(`${API_BASE_URL}/user/update/${editingUser.ID}`, editingUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(
        "Failed to edit user: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <li className="nav-item">
              <User className="nav-icon" />
              <span>Users</span>
            </li>
            {/* Add other menu items here */}
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="header-actions">
            <button className="icon-button">
              <Bell />
            </button>
            <button className="icon-button">
              <Settings />
            </button>
            <div className="user-avatar">
              <img src="user.png" alt="User" />
            </div>
          </div>
        </div>

        <div className="user-section">
          <div className="section-header">
            <h2>Users</h2>
            <button className="add-button" onClick={() => setIsAddingUser(true)}>
              <PlusCircle /> Add User
            </button>
          </div>

          {isAddingUser && (
            <div className="user-form">
              <form onSubmit={handleAddUser}>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.Username}
                  onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.Email}
                  onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.Name}
                  onChange={(e) => setNewUser({ ...newUser, Name: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.Password}
                  onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
                  required
                />
                <div className="form-buttons">
                  <button type="submit" className="submit-button">Add User</button>
                  <button type="button" className="cancel-button" onClick={() => setIsAddingUser(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="user-grid">
              {filteredUsers.map((user) => (
                <div key={user.ID} className="user-card">
                  <div className="user-card-content">
                    <div className="user-avatar">
                      {user.ProfilePic?.Data ? (
                        <img
                          src={`data:image/jpeg;base64,${user.ProfilePic.Data}`}
                          alt={user.ProfilePic.Filename}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/50" 
                          alt="Placeholder"
                        />
                      )}
                    </div>
                    <h3>{user.Username || "N/A"}</h3>
                    <p>{user.Email || "N/A"}</p>
                    <p>{user.Name || "N/A"}</p>
                    <div className="user-details">
                      <p>Status: {user.Status || "N/A"}</p>
                      <p>GPA: {user.GPA != null ? user.GPA.toFixed(2) : "N/A"}</p>
                      <p>Hours: {user.Hours != null ? user.Hours : "N/A"}</p>
                    </div>
                    <div className="card-actions">
                      <button className="icon-button" onClick={() => setEditingUser(user)}>
                        <Edit2 />
                      </button>
                      <button className="icon-button" onClick={() => handleDelete(user.ID)}>
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditUser();
            }}>
              <input
                type="text"
                placeholder="Username"
                value={editingUser.Username}
                onChange={(e) => setEditingUser({ ...editingUser, Username: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.Email}
                onChange={(e) => setEditingUser({ ...editingUser, Email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Name"
                value={editingUser.Name}
                onChange={(e) => setEditingUser({ ...editingUser, Name: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-button">Update User</button>
                <button type="button" className="cancel-button" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;