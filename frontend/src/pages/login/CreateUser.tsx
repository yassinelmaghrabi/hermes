import React, { useState, useEffect } from "react";
import { Camera, Loader2, Check, User, Mail, Key, BookOpen, Clock } from "lucide-react";
import axios from "axios";

const CreateUser = () => {
  // Original state management
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [gpa, setGpa] = useState<number | "">(0);
  const [hours, setHours] = useState<number | "">(0);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced UI states
  const [activeField, setActiveField] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength calculator
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  // Simulated upload progress
  useEffect(() => {
    if (isLoading && uploadProgress < 90) {
      const timer = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      return () => clearInterval(timer);
    }
  }, [isLoading, uploadProgress]);

  // Handle Create User function
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    let base64Image = "";
    if (profilePic) {
      const reader = new FileReader();
      reader.readAsDataURL(profilePic);
      reader.onloadend = async () => {
        base64Image = reader.result as string;

        const userData = {
          Username: username,
          Email: email,
          Name: name,
          Password: password,
          Status: "",
          GPA: gpa === "" ? 0 : gpa,
          Hours: hours === "" ? 0 : hours,
          ProfilePic: {
            filename: profilePic.name.split('.')[0],
            data: base64Image.split(",")[1],
          },
        };

        try {
          const response = await axios.post(
            "https://hermes-1.onrender.com/api/auth/register",
            userData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("User created:", response.data);
          setSuccess("User created successfully.");
          setUploadProgress(100);

          await uploadProfilePicture(profilePic);

          // Clear form fields
          setUsername("");
          setEmail("");
          setName("");
          setPassword("");
          setGpa(0);
          setHours(0);
          setProfilePic(null);
          setPreviewUrl("");
        } catch (err: any) {
          setError(err.response?.data?.error || "Failed to create user.");
          console.error("Error creating user:", err);
        } finally {
          setIsLoading(false);
        }
      };
    } else {
      setError("Please upload a profile picture.");
      setIsLoading(false);
    }
  };

  // Upload Profile Picture function
  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await axios.post(
        "https://hermes-1.onrender.com/api/users/profilePic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profile picture uploaded:", response.data);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0f1a] flex items-center justify-center p-6">
      {/* Main Container with Glass Effect */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full animate-[spin_8s_linear_infinite_reverse]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create New User
          </h2>
          <p className="text-gray-400 text-center mb-8">Welcome to Hermes</p>

          <form onSubmit={handleCreateUser} className="space-y-8">
            {/* Profile Upload Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-36 h-36 group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover border-4 border-purple-500/30 group-hover:border-purple-500 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-4 border-purple-500/30 flex items-center justify-center group-hover:border-purple-500 transition-all duration-300">
                    <Camera className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-400">Click to upload profile picture</p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 ${activeField === 'username' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setActiveField('username')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="Username"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${activeField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="Email"
                  required
                />
              </div>

              {/* Name Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 ${activeField === 'name' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="Name"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className={`w-5 h-5 ${activeField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="Password"
                  required
                />
                <div className="flex justify-end mt-1">
                  <div className={`h-2 w-2 ${passwordStrength >= 1 ? "bg-red-400" : "bg-gray-400"} rounded-full mx-1`}></div>
                  <div className={`h-2 w-2 ${passwordStrength >= 2 ? "bg-yellow-400" : "bg-gray-400"} rounded-full mx-1`}></div>
                  <div className={`h-2 w-2 ${passwordStrength >= 3 ? "bg-blue-400" : "bg-gray-400"} rounded-full mx-1`}></div>
                  <div className={`h-2 w-2 ${passwordStrength >= 4 ? "bg-green-400" : "bg-gray-400"} rounded-full mx-1`}></div>
                </div>
              </div>

              {/* GPA Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className={`w-5 h-5 ${activeField === 'gpa' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={gpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value) || "")}
                  onFocus={() => setActiveField('gpa')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="GPA"
                  min="0"
                  max="4"
                  required
                />
              </div>

              {/* Hours Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className={`w-5 h-5 ${activeField === 'hours' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || "")}
                  onFocus={() => setActiveField('hours')}
                  onBlur={() => setActiveField('')}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg border border-white/10 focus:border-purple-500 transition-all duration-300 outline-none text-white placeholder-gray-400"
                  placeholder="Hours"
                  min="0"
                  max="200"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="inline-block w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Check className="inline-block w-5 h-5 mr-2" />
                )}
                {isLoading ? "Creating User..." : "Create User"}
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            {success && <p className="text-green-500 text-center mt-4">{success}</p>}
          </form>

          {/* Profile Picture Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Upload Profile Picture</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full mb-4"
                />
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
