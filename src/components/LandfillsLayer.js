import React, { useCallback, useState } from 'react';
import { Polygon, InfoWindow } from '@react-google-maps/api';

// GeoJSON file URL for landfill data
const GEOJSON_FILE_URL = '/Landfills.geojson';

const LandfillsLayer = () => {
  const [polygons, setPolygons] = useState([]); // Holds landfill polygons
  const [selectedPolygon, setSelectedPolygon] = useState(null); // Holds selected polygon for InfoWindow
  const [infoWindowPosition, setInfoWindowPosition] = useState(null); // Position for InfoWindow

  // Function to load landfill data from GeoJSON
  const onLoad = useCallback(() => {
    fetch(GEOJSON_FILE_URL)
      .then(response => response.json())
      .then(data => {
        const polygonsData = data.features.map((feature, index) => {
          let landfillDetails = {};
          if (index === 0) {
            landfillDetails = {
              name: 'Lakhoder Landfill',
              info: 'Capacity: 500 tons\nOpen since: 1995',
            };
          } else if (index === 1) {
            landfillDetails = {
              name: 'MehmoodBooti Landfill',
              info: 'Capacity: 300 tons\nClosed in: 2010',
            };
          }

          return {
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
            name: landfillDetails.name,
            info: landfillDetails.info,
            center: {
              lat: feature.geometry.coordinates[0][0][1],
              lng: feature.geometry.coordinates[0][0][0],
            },
          };
        }).filter(Boolean);

        setPolygons(polygonsData); // Set the loaded polygons
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
      });
  }, []);

  // Handle polygon click
  const handlePolygonClick = (polygonData) => {
    setSelectedPolygon(polygonData);
    setInfoWindowPosition(polygonData.center);
  };

  // Trigger the loading of landfill polygons when the component mounts
  React.useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <>
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

      {selectedPolygon && infoWindowPosition && (
        <InfoWindow position={infoWindowPosition} onCloseClick={() => setSelectedPolygon(null)}>
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '10px' }}>
            <h3 style={{ marginBottom: '10px', color: '#4CAF50' }}>{selectedPolygon.name}</h3>
            <p style={{ margin: '0', whiteSpace: 'pre-line' }}>{selectedPolygon.info}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default LandfillsLayer;
