import React, { useState } from "react";
import axios from "axios";
import "./CreateUser.css"; 

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

          // Optional: Upload profile picture if required by your API logic
          await uploadProfilePicture(profilePic);

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

  // Function to upload the profile picture if needed
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

  return (
    <div className="create-user-page"> 
      <div className="container"> 
        <h2>Create User</h2>
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="GPA"
            value={gpa}
            onChange={(e) => setGpa(Number(e.target.value))}
            required
          />
          <input
            type="number"
            placeholder="Credit Hours"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            required
          />
          <label className="custom-file-upload"> 
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProfilePic(e.target.files ? e.target.files[0] : null)
              }
              required
            />
            Choose Profile Picture
          </label>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
