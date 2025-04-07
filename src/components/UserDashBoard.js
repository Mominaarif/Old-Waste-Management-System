import React from "react";
import "../components/UserDashBoard.css";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-blue-600">
          Welcome to Dashboard!
        </h1>
        <p className="text-gray-700 mt-4">
          Start building your app with utility-first CSS.
        </p>
      </div>
    </div>
  );
};
export default Dashboard;
