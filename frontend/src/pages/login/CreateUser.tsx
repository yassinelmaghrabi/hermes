import React, { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import axios from "axios";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [gpa, setGpa] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Convert profile picture to base64
    let base64Image = "";
    if (profilePic) {
      const reader = new FileReader();
      reader.readAsDataURL(profilePic);
      reader.onloadend = async () => {
        base64Image = reader.result as string;

        // Prepare the user data
        const userData = {
          Username: username,
          Email: email,
          Name: name,
          Password: password,
          Status: "",
          GPA: gpa,
          Hours: hours,
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

          setSuccess("User created successfully.");
          await uploadProfilePicture(profilePic);
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
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to convert image to base64.");
        setIsLoading(false);
      };
    } else {
      setError("Please upload a profile picture.");
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      await axios.post(
        "https://hermes-1.onrender.com/api/users/profilePic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a202c] to-[#2d3748] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#1a202c] p-8 rounded-2xl shadow-2xl border border-purple-500/20">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#60a5fa]">
          Create New User
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-6">
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover border-4 border-purple-500"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center border-4 border-purple-500">
                  <Camera className="w-12 h-12 text-[#8b5cf6]" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3b82f6] transition-all">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Upload className="w-4 h-4 text-white" />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="Username"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="Email"
              required
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="Name"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="Password"
              required
            />
            <input
              type="number"
              value={gpa}
              onChange={(e) => setGpa(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="GPA"
              step="0.1"
              min="0"
              max="4.0"
              required
            />
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#2d3748] rounded-lg border border-[#4a5568] focus:border-purple-500 transition-all outline-none text-[#e2e8f0] placeholder-gray-400"
              placeholder="Credit Hours"
              required
            />
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#3b82f6] transition-all text-lg font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Creating User...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
