import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Map from "./components/Map";
import GeneateMap from "./components/GeneateMap";
import Sidebar from "./components/Sidebar";
import AddData from "./components/AddData";
import MarkerInfo from "./components/MarkerInfo";
import Landfills from "./components/Landfills";
import MainMap from "./components/MainMap";
import ForecastPage from './components/ForecastPage';
import ChatBot from 'react-simple-chatbot';
import FilePicker from './components/MlBased';

import { AuthProvider } from "./components/AuthContext"; // Adjust path if needed
import SignIn from "./components/SignInScreen";
import SignUpScreen from "./components/SignUpScreen";


const steps = [
  {
    id: '0',
    message: 'Hi!',
    trigger: '1',
  },
  {
    id: '1',
    message: 'What is your name?',
    trigger: '2',
  },
  {
    id: '2',
    user: true,
    trigger: '3',
  },
  {
    id: '3',
    message: 'Nice to meet you, {previousValue}!',
    trigger: '4',
  },
  {
    id: '4',
    message: 'Ask me any question related to solid waste management...',
  }
];

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="Main_Container">
        <Sidebar />
        <div className="left-Conitainer">
          <Routes>
            <Route path="/" element={<Map />} /> 
            <Route path="/map" element={<GeneateMap />} /> 
            <Route path="/map2" element={<AddData />} /> 
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/landfills" element={<Landfills />} /> 
            <Route path="/mainmap" element={<MainMap />} /> 
            <Route path="/marker-info" element={<MarkerInfo />} />
            <Route path="/ml-based" element={<FilePicker/>} />
            {/* <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUpScreen />} /> */}

          </Routes>
        </div>

        {/* Chatbot using FloatingButton */}
        <ChatBot 
          steps={steps} 
          floating={true}  // Adds floating button for chatbot toggle
        />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
