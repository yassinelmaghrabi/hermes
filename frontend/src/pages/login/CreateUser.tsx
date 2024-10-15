// CreateUser.tsx
import React, { useState } from "react";
import axios from "axios";

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("https://hermes-1.onrender.com/api/user/add", {
        username, 
        email,
        password
      });

      console.log("User created:", response.data);
      setSuccess("User created successfully.");
      setUsername(""); 
      setEmail(""); 
      setPassword(""); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[400px] p-8 bg-[#1C1F2C] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create User</h2>
        <form onSubmit={handleCreateUser}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username" 
              className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}

          <div>
            <button
              type="submit"
              className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center cursor-pointer hover:bg-white hover:text-black transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Creating user..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
