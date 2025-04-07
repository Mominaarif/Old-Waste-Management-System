import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Polygon, InfoWindow } from '@react-google-maps/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Constants for styling and configurations
const containerStyle = {
  width: "calc(100% + (250px))",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "-180px",
  border: "2px solid #73AD21",
  zIndex: 1,
  boxSizing: "border-box",
};

const center = { lat: 30.3, lng: 67.3 };
const JSON_FILE_URL = '/Union_Council.json';
const libraries = ['places'];

const GenerateMap = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showPieChart, setShowPieChart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('residential');

  // Fetch polygon data on map load
  const onLoad = useCallback((map) => {
    fetch(JSON_FILE_URL)
      .then(response => response.json())
      .then(data => {
        const polygonsData = data.geometries.map((geometry, index) => {
          if (geometry.type === 'Polygon') {
            return createPolygonData(geometry, index);
          }
          return null;
        }).filter(Boolean);

        setPolygons(polygonsData);
      })
      .catch(error => console.error('Error loading JSON data:', error));
  }, []);

  // Create polygon data including waste categories
  const createPolygonData = (geometry, index) => ({
    id: index,
    paths: geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] })),
    wasteCategories: generateWasteCategories()
  });

  // Generate random waste categories data
  const generateWasteCategories = () => ({
    residential: generateRandomWasteData(),
    commercial: generateRandomWasteData(),
    industrial: generateRandomWasteData(),
    hazardous: generateRandomHazardousWasteData(),
  });

  // Random waste data generator
  const generateRandomWasteData = () => ({
    paper: Math.floor(Math.random() * 500) + 50,
    cardboard: Math.floor(Math.random() * 300) + 30,
    lightPlastic: Math.floor(Math.random() * 100) + 10,
    densePlastic: Math.floor(Math.random() * 50) + 5,
    textile: Math.floor(Math.random() * 200) + 20,
    foodWaste: Math.floor(Math.random() * 500) + 50,
    yardWaste: Math.floor(Math.random() * 300) + 30,
    metals: Math.floor(Math.random() * 100) + 10,
    glass: Math.floor(Math.random() * 50) + 5,
    diapers: Math.floor(Math.random() * 100) + 10,
    animalDunk: Math.floor(Math.random() * 200) + 20,
    wood: Math.floor(Math.random() * 300) + 30,
    electronic: Math.floor(Math.random() * 50) + 5,
    leather: Math.floor(Math.random() * 50) + 5,
    cdWaste: Math.floor(Math.random() * 50) + 5,
  });

  const generateRandomHazardousWasteData = () => ({
    needles: Math.floor(Math.random() * 100) + 10,
    syringes: Math.floor(Math.random() * 50) + 5,
    scalpels: Math.floor(Math.random() * 30) + 3,
    infusionSets: Math.floor(Math.random() * 20) + 2,
    sawsKnives: Math.floor(Math.random() * 50) + 5,
    blades: Math.floor(Math.random() * 50) + 5,
    chemicals: Math.floor(Math.random() * 100) + 10,
  });

  // Handle polygon click
  const handlePolygonClick = (polygonData, event) => {
    setSelectedPolygon({ ...polygonData, position: event.latLng });
    setShowPieChart(false);
  };

  // Handle pie chart visibility and category change
  const handleWasteClick = () => setShowPieChart(true);
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowPieChart(true);
  };

  // Prepare pie chart data
  const pieChartData = {
    labels: selectedPolygon ? Object.keys(selectedPolygon.wasteCategories[selectedCategory]) : [],
    datasets: [{
      label: 'Waste',
      data: selectedPolygon ? Object.values(selectedPolygon.wasteCategories[selectedCategory]) : [],
      backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'],
      hoverBackgroundColor: ['#27ae60', '#2980b9', '#c0392b', '#f39c12']
    }]
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
      >
        {polygons.map((polygon, index) => (
          <Polygon
            key={index}
            paths={polygon.paths}
            onClick={(event) => handlePolygonClick(polygon, event)}
          />
        ))}
        {selectedPolygon && (
          <>
            <InfoWindow position={selectedPolygon.position} onCloseClick={() => setSelectedPolygon(null)}>
              <div>
                <h3>{`Polygon ${selectedPolygon.id + 1}`}</h3>
                <p>UC ID: UC{selectedPolygon.id + 1}</p>
                <p>Population: {Math.floor(Math.random() * 10000) + 1000}</p>
                <p>Households: {Math.floor(Math.random() * 500) + 50}</p>
                <p>Wealthy: {Math.random() < 0.5 ? 'Yes' : 'No'}</p>
                <p onClick={handleWasteClick}>Total Waste Generated: {Math.floor(Math.random() * 1000) + 100} kg</p>
                <div>
                  <button onClick={() => handleCategoryChange('residential')}>Residential</button>
                  <button onClick={() => handleCategoryChange('commercial')}>Commercial</button>
                  <button onClick={() => handleCategoryChange('industrial')}>Industrial</button>
                  <button onClick={() => handleCategoryChange('hazardous')}>Hazardous</button>
                </div>
              </div>
            </InfoWindow>
            {showPieChart && (
              <InfoWindow position={selectedPolygon.position} onCloseClick={() => setShowPieChart(false)}>
                <div>
                  <Pie data={pieChartData} />
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GenerateMap;
