// src/components/SignUpScreen.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import `useNavigate` from React Router
import { auth, createUserWithEmailAndPassword } from "../firebase"; // Import Firebase functions
import "./SignUpScreen.css"; // Import CSS for styling


function SignUpScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    setError(""); // Clear previous errors
    setLoading(true); // Set loading to true during the signup process

    try {
      // Use Firebase's createUserWithEmailAndPassword method (v9+ syntax)
      await createUserWithEmailAndPassword(auth, email, password);
      // Signup successful
      console.log("Signup successful:", formData);

      // Set the success message
      setSuccessMessage("Account created successfully!");

      // Optionally clear form data
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // After 2 seconds, navigate to the Sign In page
      setTimeout(() => {
        navigate("/signin"); // Navigate to Sign In page
      }, 2000); // Adjust time for how long you want the success message to show
    } catch (err) {
      setError(err.message); // Set error message from Firebase
      console.error("Error signing up:", err.message);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="signup-Main-container">
      <div className="signup-container">
        <div className="signup-form">
          <h2>Create a new account</h2>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}{" "}
          {/* Display success message */}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p>
            Already have an account? <a href="/signin">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpScreen;
