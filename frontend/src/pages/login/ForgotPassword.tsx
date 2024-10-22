import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css"; //nafs file ell css

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    // Simulated API call - hen han7ot el api
    try {
      // For now, just showing success message
      setTimeout(() => {
        setStatus({
          type: "success",
          message: "Reset link sent! Please check your email.",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to send reset link. Please try again.",
      });
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
      <div className="relative z-20 w-full h-full flex">
        {/* Left Side - Logo Section */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center">
          <img src="logo.svg" alt="Logo" className="w-400 h-400 logo" />
          <h2 className="testt">HERMES</h2>
        </div>

        {/* Right Side - Forgot Password Form Section */}
        <div className="w-1/2 h-full flex flex-col p-20 justify-center">
          <div className="w-full flex flex-col max-w-[450px] mx-auto login-container">
            <div className="bg-[#1C1F2C] p-10 rounded-lg shadow-lg relative z-30">
              {/* Header */}
              <div className="w-full flex items-center flex-col mb-10 text-white">
                <h3 className="text-4xl font-bold mb-2">Reset Password</h3>
                <p className="text-gray-400 text-center mt-2">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="w-full flex flex-col mb-6">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {status.message && (
                  <div
                    className={`mb-4 p-3 rounded ${
                      status.type === "success"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="w-full flex flex-col mb-4">
                  <button
                    type="submit"
                    className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>

                {/* Back to Login Link */}
                <div className="w-full flex items-center justify-center mt-6">
                  <Link
                    to="/login"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;