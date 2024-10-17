// CreateUser.tsx
import React, { useState } from "react";
import axios from "axios";

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [gpa, setGpa] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [profilePic, setProfilePic] = useState<File | null>(null);
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
            filename: profilePic.name.split('.')[0], // Extract filename without extension
            data: base64Image.split(",")[1], // Remove the prefix from the base64 string
          },
        };

        try {
          const response = await axios.post(
            "https://hermes-1.onrender.com/api/auth/add", // Update to your actual endpoint
            userData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is included
              },
            }
          );

          console.log("User created:", response.data);
          setSuccess("User created successfully.");

          // Clear form fields
          setUsername("");
          setEmail("");
          setName("");
          setPassword("");
          setGpa(0);
          setHours(0);
          setProfilePic(null);
        } catch (err: any) {
          setError(err.response?.data?.error || "Failed to create user.");
          console.error("Error creating user:", err);
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

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[400px] p-8 bg-[#1C1F2C] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create User
        </h2>
        <form onSubmit={handleCreateUser}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="GPA"
              value={gpa}
              onChange={(e) => setGpa(Number(e.target.value))}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Credit Hours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              required
              className="w-full p-2 rounded-md"
            />
          </div>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProfilePic(e.target.files ? e.target.files[0] : null)
              }
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
              {isLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
