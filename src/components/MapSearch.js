// MapSearch.js
import React, { useRef } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

const MapSearch = ({ onLocationSelect }) => {
  const searchBoxRef = useRef(null);

  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref; // Save reference to the search box
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    
    // Check if places is defined and has at least one place
    if (places && places.length > 0) {
      const location = places[0]?.geometry?.location;

      if (location) {
        onLocationSelect(location); // Pass the selected location back to the parent
      }
    } else {
      console.error("No places found or places is undefined.");
    }
  };

  return (
    <StandaloneSearchBox
      onLoad={onSearchBoxLoad}
      onPlacesChanged={onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Search for a location..."
        style={{
          boxSizing: 'border-box',
          border: '1px solid transparent',
          width: '240px',
          height: '40px',
          marginTop: '10px',
          padding: '0 12px',
          borderRadius: '3px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          fontSize: '16px',
          outline: 'none',
          textOverflow: 'ellipses',
          position: 'absolute',
          left: '50%',
          marginLeft: '-120px',
          zIndex: 10,
        }}
      />
    </StandaloneSearchBox>
  );
};

export default MapSearch;
