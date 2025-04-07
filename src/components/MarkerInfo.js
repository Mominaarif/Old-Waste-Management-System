import React from 'react';
import { useLocation } from 'react-router-dom';

const MarkerInfo = () => {
  const location = useLocation();
  const markers = location.state || []; // Retrieve passed marker info

  return (
    <div style={{ padding: '20px' }}>
      <h1>Waste Information</h1>
      {markers.length === 0 ? (
        <p>No markers to display.</p>
      ) : (
        markers.map((marker, index) => (
          <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h2>Locations {index + 1}</h2>
            <p><strong>Location:</strong> ({marker.lat}, {marker.lng})</p>
            <p><strong>Paper:</strong> {marker.data.paper}</p>
            <p><strong>Plastic:</strong> {marker.data.plastic}</p>
            <p><strong>Glass:</strong> {marker.data.glass}</p>
            <p><strong>Metal:</strong> {marker.data.metal}</p>
            <p><strong>Organic:</strong> {marker.data.organic}</p>
            <p><strong>Industrial:</strong> {marker.data.glass}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MarkerInfo;
