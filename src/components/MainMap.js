import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Polygon, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: "100%",
  height: "100vh",
  position: "relative",
};

const buttonContainerStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1,
};

const center = { lat: 30.3, lng: 67.3 };
const WASTE_JSON_FILE_URL = '/Union_Council.json';
const GEOJSON_FILE_URL = '/Landfills.geojson';

const CombinedMap = () => {
  const [wastePolygons, setWastePolygons] = useState([]);
  const [landfillPolygons, setLandfillPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showWasteLayer, setShowWasteLayer] = useState(false);
  const [showLandfillLayer, setShowLandfillLayer] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);

  const onLoad = useCallback((map) => {
    // Load waste data
    fetch(WASTE_JSON_FILE_URL)
      .then(response => response.json())
      .then(data => {
        const polygonsData = data.geometries.map((geometry, index) => {
          if (geometry.type === 'Polygon') {
            return {
              id: index,
              paths: geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] })),
            };
          }
          return null;
        }).filter(Boolean);
        setWastePolygons(polygonsData);
      })
      .catch(error => console.error('Error loading waste data:', error));

    // Load landfill data
    fetch(GEOJSON_FILE_URL)
      .then(response => response.json())
      .then(data => {
        const polygonsData = data.features.map((feature, index) => {
          return {
            id: index,
            paths: feature.geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] })),
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#32CD32',
            fillOpacity: 0.5,
          };
        });
        setLandfillPolygons(polygonsData);
      })
      .catch(error => console.error('Error loading landfill data:', error));
  }, []);

  const handlePolygonClick = (polygonData, event) => {
    setSelectedPolygon({ ...polygonData, position: event.latLng });
    setShowPieChart(false);
  };

  const handleCloseClick = () => setSelectedPolygon(null);
  const handleWasteClick = () => setShowPieChart(true);
  const handlePieChartClose = () => setShowPieChart(false);

  const toggleWasteLayer = () => {
    if (!showWasteLayer) {
      setShowWasteLayer(true);  // Show waste layer
      setShowLandfillLayer(false); // Hide landfill layer
      setLandfillPolygons([]);   // Clear landfill polygons
    } else {
      setShowWasteLayer(false);  // Toggle waste layer off
    }
  };

  const toggleLandfillLayer = () => {
    if (!showLandfillLayer) {
      setShowLandfillLayer(true);  // Show landfill layer
      setShowWasteLayer(false);    // Hide waste layer
      setWastePolygons([]);        // Clear waste polygons
    } else {
      setShowLandfillLayer(false);  // Toggle landfill layer off
    }
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY">
      <div style={containerStyle}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={8}
          onLoad={onLoad}
        >
          {/* Waste Polygons */}
          {showWasteLayer && wastePolygons.map((polygon, index) => (
            <Polygon
              key={index}
              paths={polygon.paths}
              onClick={(event) => handlePolygonClick(polygon, event)}
            />
          ))}

          {/* Landfill Polygons */}
          {showLandfillLayer && landfillPolygons.map((polygon, index) => (
            <Polygon
              key={index}
              paths={polygon.paths}
              strokeColor={polygon.strokeColor}
              strokeOpacity={polygon.strokeOpacity}
              strokeWeight={polygon.strokeWeight}
              fillColor={polygon.fillColor}
              fillOpacity={polygon.fillOpacity}
              onClick={(event) => handlePolygonClick(polygon, event)}
            />
          ))}

          {selectedPolygon && (
            <InfoWindow position={selectedPolygon.position} onCloseClick={handleCloseClick}>
              <div>
                <button onClick={handleWasteClick}>Show Waste Chart</button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Button Container */}
        <div style={buttonContainerStyle}>
          <button onClick={toggleWasteLayer}>
            Toggle Waste Layer
          </button>
          <button onClick={toggleLandfillLayer}>
            Toggle Landfill Layer
          </button>
        </div>
      </div>
    </LoadScript>
  );
};

export default CombinedMap;
