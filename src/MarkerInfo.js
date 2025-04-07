import React from 'react';
import { useLocation } from 'react-router-dom';

const MarkerInfo = () => {
  const location = useLocation();
  const markers = location.state || []; // Retrieve passed marker info

  return (
    <div style={{ padding: '20px' }}>
      <h1>Marker Information</h1>
      {markers.length === 0 ? (
        <p>No markers to display.</p>
      ) : (
        markers.map((marker, index) => (
          <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h2>Marker {index + 1}</h2>
            <p><strong>Location:</strong> ({marker.lat}, {marker.lng})</p>
            <p><strong>Name:</strong> {marker.data.name}</p>
            <p><strong>Description:</strong> {marker.data.description}</p>
            <p><strong>Value:</strong> {marker.data.value}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MarkerInfo;
