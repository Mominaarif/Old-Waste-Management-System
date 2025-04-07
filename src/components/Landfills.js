import React, { useCallback, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, InfoWindow } from '@react-google-maps/api';
import MapSearch from './MapSearch';

const containerStyle = {
  width: "calc(100% + (250px))",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "-120px",
  border: "2px solid #73AD21",
  zIndex: 1,
  boxSizing: "border-box",
};

const libraries = ['places'];

const center = {
  lat: 31.633833529312497, 
  lng: 74.41767832303097,
};

const options = {};

const Landfills = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handlePolygonClick = (polygonData) => {
    setSelectedPolygon(polygonData);
    setInfoWindowPosition(polygonData.center);
  };

  const handleLocationSelect = (location) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(12);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geoJson = JSON.parse(e.target.result);
          const polygonsData = geoJson.features.map((feature, index) => ({
            id: index,
            paths: feature.geometry.coordinates[0].map(coord => ({
              lat: coord[1],
              lng: coord[0],
            })),
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#32CD32',
            fillOpacity: 0.35,
            name: feature.properties.name || `Landfill ${index + 1}`,
            info: feature.properties.info || 'No details available',
            center: {
              lat: feature.geometry.coordinates[0][0][1],
              lng: feature.geometry.coordinates[0][0][0],
            },
          }));
          setPolygons(polygonsData);
        } catch (error) {
          console.error('Error parsing the uploaded GeoJSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyClURLc6gcn9M_AOXj6gUsYYk147-T_FDA" libraries={libraries}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} onLoad={onLoad} options={options}>
          {polygons.map((polygon, index) => (
            <Polygon
              key={index}
              paths={polygon.paths}
              strokeColor={polygon.strokeColor}
              strokeOpacity={polygon.strokeOpacity}
              strokeWeight={polygon.strokeWeight}
              fillColor={polygon.fillColor}
              fillOpacity={polygon.fillOpacity}
              onClick={() => handlePolygonClick(polygon)}
            />
          ))}
          <MapSearch onLocationSelect={handleLocationSelect} />
          {selectedPolygon && infoWindowPosition && (
            <InfoWindow position={infoWindowPosition} onCloseClick={() => setSelectedPolygon(null)}>
              <div style={{ fontFamily: 'Arial, sans-serif', padding: '10px' }}>
                <h3 style={{ marginBottom: '10px', color: '#4CAF50' }}>{selectedPolygon.name}</h3>
                <p style={{ margin: '0', whiteSpace: 'pre-line' }}>
                  {selectedPolygon.info}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
        <input
          type="file"
          accept=".geojson"
          onChange={handleFileUpload}
          style={{ padding: '10px', cursor: 'pointer' }}
        />
        {uploadedFileName && (
          <p style={{ marginTop: '10px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            Uploaded File: <strong>{uploadedFileName}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Landfills;
