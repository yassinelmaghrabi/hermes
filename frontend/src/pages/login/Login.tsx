import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const getUserIdFromToken = (token: string) => {
    if (!token) {
      throw new Error("Token is required");
    }
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Attempting to log in with:", { username, password });

    try {
      const response = await axios.post(
        "https://hermes-1.onrender.com/api/auth/login",
        {
          username,
          password,
        }
      );

      console.log("Login successful:", response.data);
      const token = response.data.token;

      localStorage.setItem("token", token);

      const userId = getUserIdFromToken(token);
      localStorage.setItem("userId", userId);

      console.log("User ID:", userId);

      // Navigate to /enroll after successful login
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to log in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="line line-1">
          <div className="wave wave1"></div>
        </div>
        <div className="line line-2">
          <div className="wave wave2"></div>
        </div>
        <div className="line line-3">
          <div className="wave wave3"></div>
        </div>
      </div>

      {/* Background split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-[#0e0f1a]"></div>
        <div className="w-1/2 bg-[#0B0C15]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-20 w-full h-full flex flex-col md:flex-row">
        {/* Left Side - Logo Section */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center">
          <img src="../../../public/logo.svg" alt="Logo" className="logo" />
          <h2 className="testt">HERMES</h2>
        </div>

        {/* Right Side - Login Form Section */}
        <div className="w-full md:w-1/2 h-full flex flex-col p-5 md:p-20 justify-center">
          <div className="w-full flex flex-col max-w-[450px] mx-auto login-container">
            <div className="bg-[#1C1F2C] p-5 md:p-10 rounded-lg shadow-lg relative z-30">
              {/* Header */}
              <div className="w-full flex items-center flex-col mb-10 text-white">
                <h3 className="text-2xl md:text-4xl font-bold mb-2">Login</h3>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin}>
                <div className="w-full flex flex-col mb-6">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display error message */}

                {/* Login Button */}
                <div className="w-full flex flex-col mb-4">
                  <button
                    type="submit"
                    className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="w-full flex items-center justify-center mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="w-full flex items-center justify-center mt-6">
                <p className="text-sm font-normal text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-white cursor-pointer underline ml-1"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
