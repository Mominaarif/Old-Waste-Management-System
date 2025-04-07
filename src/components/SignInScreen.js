// src/components/SignInScreen.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import the auth instance
import { useAuth } from './AuthContext';

import "../components/SignInScreen.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }

    try {
      // Use Firebase Authentication to sign in the user
      await signInWithEmailAndPassword(auth, email, password);

      // If successful, clear the error and navigate to the dashboard
      setError("");
      setEmail("");
      setPassword("");
      login();
      navigate("/map2"); // Navigate to Dashboard upon successful login
    } catch (error) {
      // Handle errors from Firebase Authentication
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <div className="signin-background">
      <div className="signin-container">
        <h2>Sign In</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
        <p>
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
