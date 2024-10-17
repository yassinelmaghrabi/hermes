import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";

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

  const API_BASE_URL = "https://hermes-1.onrender.com/api"; 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1]; 
    console.log("Token:", token);

    try {
      console.log("Sending request to:", `${API_BASE_URL}/user/getall`);
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
      });

      const response = await axios.get(`${API_BASE_URL}/user/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response:", response.data);
      const usersArray = response.data.users || [];
      setUsers(usersArray);
    } catch (err) {
      console.error("Error details:", err);
      if (axios.isAxiosError(err)) {
        console.error("Response data:", err.response?.data);
        console.error("Response status:", err.response?.status);
        console.error("Response headers:", err.response?.headers);
        console.error("Request config:", err.config);
      }
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
      console.error(err);
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
      fetchUsers();
    } catch (err) {
      setError(
        "Failed to add user: " +
          (err instanceof Error ? err.message : String(err))
      );
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">User Management</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-2 mb-4 border rounded bg-gray-800 text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="mb-4">
        <input
          type="text"
          placeholder="Username"
          className="p-2 mb-2 border rounded bg-gray-800 text-white"
          value={newUser.Username}
          onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 mb-2 border rounded bg-gray-800 text-white m-4"
          value={newUser.Email}
          onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Name"
          className="p-2 mb-2 border rounded bg-gray-800 text-white"
          value={newUser.Name}
          onChange={(e) => setNewUser({ ...newUser, Name: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 mb-2 border rounded bg-gray-800 text-white m-4"
          value={newUser.Password}
          onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Add User
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* User List */}
      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <ul>
          {filteredUsers.map((user) => (
            <li
              key={user.ID}
              className="mb-2 p-2 border rounded flex justify-between items-center bg-gray-800 text-white"
            >
              <div className="flex items-center">
                {/* Profile Picture */}
                {user.ProfilePic?.Data ? (
                  <img
                    src={`data:image/jpeg;base64,${user.ProfilePic.Data}`}
                    alt={user.ProfilePic.Filename}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/50" 
                    alt="Placeholder"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <strong>{user.Username || "N/A"}</strong> -{" "}
                  {user.Email || "N/A"} ({user.Name || "N/A"})
                  <div>Status: {user.Status || "N/A"}</div>
                  <div>GPA: {user.GPA != null ? user.GPA.toFixed(2) : "N/A"}</div>
                  <div>Hours: {user.Hours != null ? user.Hours : "N/A"}</div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(user.ID)}
                className="p-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserManagement;
