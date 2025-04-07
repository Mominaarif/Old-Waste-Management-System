import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Sidebar.css";
import { useAuth } from './AuthContext';

function Sidebar() {
  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logout();
      alert("Logged out successfully!");
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Solid Waste Management</h3>
      </div>
      <div className="sidebar-content">
        <hr className="sidebar-divider" />
        <div className="sidebar-links">
          <div className="sidebar-link">
            <Link to="/">Home</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/landfills">Landfills</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/map2">Manage Projects</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/map">Waste Generation Map</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/ml-based">ML Based Categorization</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/cf-analysis">View Projects</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/mainmap">About</Link>
          </div>
          <hr className="sidebar-divider" />
          <div className="sidebar-link">
            <Link to="/contact">Contact</Link>
          </div>
          <hr className="sidebar-divider" />

          {!user ? (
            <div className="sidebar-link" style={{ marginTop: "60px" }}>
              <Link to="/signin">Log Into Your Account</Link>
            </div>
          ) : (
            <>
              <hr className="sidebar-divider" />
              <div className="sidebar-link">
                <p>Logged in as: {user.email}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
