
//"AIzaSyAo_mqWaTaovIAeSAUFCI9lBNNIwxx6_bE"

import React, { useCallback,useEffect, useState ,useRef} from 'react';
import { GoogleMap, LoadScript, Polygon, InfoWindow } from '@react-google-maps/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './GeneateMap.css';
import { useNavigate } from 'react-router-dom';

import MapSearch from './MapSearch';

ChartJS.register(ArcElement, Tooltip, Legend);

const containerStyle = {
  width: "calc(100% + (180px))",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "-120px",
  border: "2px solid #73AD21",
  zIndex: 1,
  boxSizing: "border-box",
};

const libraries = ['places'];
const center = { lat: 30.3, lng: 67.3 };

const JSON_FILE_URL = '/District_Boundary.json';

const options = {};

const infoWindowStyle = {
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  maxWidth: '500px',
  minWidth: '300px',
  lineHeight: '1.5',
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '12px',
  color: '#2c3e50',
  textAlign: 'center',
  borderBottom: '2px solid #ddd',
  paddingBottom: '8px',
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#34495e',
  marginBottom: '4px',
  display: 'flex',
  alignItems: 'center',
};

const valueStyle = {
  color: '#2c3e50',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

const iconStyle = {
  marginRight: '8px',
  color: '#e74c3c',
};

const pieChartStyle = {
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  maxWidth: '650px',
  minWidth: '450px',
  lineHeight: '2.5',
};





const GeneateMap = ({ setCurrentValues }) => {
  const [showComparisonInputs, setShowComparisonInputs] = useState(false);
  const [viewType, setViewType] = useState('district');

const handleToggleComparisonInputs = () => {
  setShowComparisonInputs((prev) => !prev);
};
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const navigate = useNavigate(); 
  const [mapKey, setMapKey] = useState(0); // Key to force remount
  const [showPieChart, setShowPieChart] = useState(false);
  const [forecastYear, setForecastYear] = useState(1); // Changed to a number for easier handling
  const [selectedCategory, setSelectedCategory] = useState('residential');
  const wealthCategories = ['High Income', 'Higher Middle Income', 'Lower Middle Income', 'Low Income'];
  const randomWealthCategory = wealthCategories[Math.floor(Math.random() * wealthCategories.length)];
  const [population, setPopulation] = useState(0);
  const [households, setHouseholds] = useState(0);
  const mapRef = useRef(null);
  const [totalWaste, setTotalWaste] = useState(0);
  const [polygonColors, setPolygonColors] = useState({});
  const [wealthCategory, setWealthCategory] = useState('');
//  const [forecastedValue, setForecastedValue] = useState(null); // To store forecasted value
  const [forecastedValues, setForecastedValues] = useState({});
  const GROWTH_RATE = 0.024; // 2.4% growth rate
const WASTE_GENERATION_RATE = (0.283 + 0.612) / 2; // Average waste generation rate
const [ucId1, setUcId1] = useState('');
const [ucId2, setUcId2] = useState('');
const [comparisonResults, setComparisonResults] = useState(null);

const [legend, setLegend] = React.useState({
  green: '',
  yellow: '',
  red: '',
});


const options = {
  strokeColor: 'blue', // Red stroke color
  strokeOpacity: 0.8,     // Stroke opacity
  strokeWeight: 2,        // Stroke width
  fillColor: '#FF0000',   // Fill color
  fillOpacity: 0.35,      // Fill opacity (35%)
};


const onLoad = useCallback((map,JSON_FILE_URL) => {
  mapRef.current = map;
  fetch(JSON_FILE_URL)
    .then(response => response.json())
    .then(data => {
      // Ensure data has the expected structure
      if (!data || !data.features) {
        console.error("Invalid data structure:", data);
        return;
      }

      const polygonsData = data.features.map((feature, index) => {
        // Check if the feature geometry type is Polygon
        if (feature.geometry.type === 'Polygon') {
          // Access coordinates and convert them into lat/lng pairs
          const coordinates = feature.geometry.coordinates[0]; // Coordinates for the polygon

          const residentialWaste = {
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
          };

          const commercialWaste = {
            paper: Math.floor(Math.random() * 300) + 30,
            cardboard: Math.floor(Math.random() * 200) + 20,
            lightPlastic: Math.floor(Math.random() * 50) + 5,
            densePlastic: Math.floor(Math.random() * 25) + 3,
            textile: Math.floor(Math.random() * 100) + 10,
            foodWaste: Math.floor(Math.random() * 300) + 30,
            yardWaste: Math.floor(Math.random() * 200) + 20,
            metals: Math.floor(Math.random() * 50) + 5,
            glass: Math.floor(Math.random() * 25) + 3,
            diapers: Math.floor(Math.random() * 50) + 5,
            animalDunk: Math.floor(Math.random() * 100) + 10,
            wood: Math.floor(Math.random() * 100) + 10,
            electronic: Math.floor(Math.random() * 25) + 3,
            leather: Math.floor(Math.random() * 25) + 3,
            cdWaste: Math.floor(Math.random() * 25) + 3,
          };

          const industrialWaste = {
            paper: Math.floor(Math.random() * 400) + 40,
            cardboard: Math.floor(Math.random() * 250) + 25,
            lightPlastic: Math.floor(Math.random() * 75) + 7,
            densePlastic: Math.floor(Math.random() * 35) + 4,
            textile: Math.floor(Math.random() * 150) + 15,
            foodWaste: Math.floor(Math.random() * 400) + 40,
            yardWaste: Math.floor(Math.random() * 250) + 25,
            metals: Math.floor(Math.random() * 75) + 7,
            glass: Math.floor(Math.random() * 35) + 4,
            diapers: Math.floor(Math.random() * 75) + 7,
            animalDunk: Math.floor(Math.random() * 150) + 15,
            wood: Math.floor(Math.random() * 150) + 15,
            electronic: Math.floor(Math.random() * 35) + 4,
            leather: Math.floor(Math.random() * 35) + 4,
            cdWaste: Math.floor(Math.random() * 35) + 4,
          };

          const hazardousWaste = {
            needles: Math.floor(Math.random() * 100) + 10,
            syringes: Math.floor(Math.random() * 50) + 5,
            scalpels: Math.floor(Math.random() * 30) + 3,
            infusionSets: Math.floor(Math.random() * 20) + 2,
            sawsKnives: Math.floor(Math.random() * 50) + 5,
            blades: Math.floor(Math.random() * 50) + 5,
            chemicals: Math.floor(Math.random() * 100) + 10,
          };

          setPopulation(Math.floor(Math.random() * 10000) + 1000);
          setHouseholds(Math.floor(Math.random() * 500) + 50);
          setTotalWaste(Math.floor(Math.random() * 1000) + 100);
          setWealthCategory(randomWealthCategory);

          // Return polygon data with coordinates mapped to lat/lng
          return {
            id: index,
            city: feature.properties.DISTRICT, // Assuming city is in the properties
            paths: coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
            wasteCategories: {
              residential: residentialWaste,
              commercial: commercialWaste,
              industrial: industrialWaste,
              hazardous: hazardousWaste,
            },
            options: {
              strokeColor: '#0f6175',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#ada5a5',
              fillOpacity: 0.35,
            }
          };
        }
        return null;
      }).filter(Boolean); // Remove null values (non-polygon features)

      setPolygons(polygonsData);
    })
    .catch(error => console.error('Error loading JSON data:', error));
}, []);

const handleLoadMap = (map, url) => {
  onLoad(map, url);
};

useEffect(() => {
  let url;
  switch (viewType) {
    case 'unionCouncil':
      url = '/Union_Council_VF.json';
      break;
    case 'province':
      url = '/Provinces_VF.json';
      break;
    case 'district':
    default:
      url = '/District_Boundary.json';
      break;
  }
  setPolygons([]); // Clear previous polygons
  //loadPolygonData(url);
  //onLoad()
  handleLoadMap(mapRef.current, url);
  setMapKey(prevKey => prevKey + 1); // Change key to remount map
}, [viewType]);

const handleViewChange = (type) => {
  setViewType(type);
  setSelectedPolygon(null); // Clear selected polygon
};

  const handleLocationSelect = (location) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(12);
    }
  };

  const handlePolygonColorChange = (selectedCategory = 'total') => {
    const newColors = {};
    const updatedLegend = {};
  
    // Step 1: Calculate percentage for each polygon
    const polygonPercentages = polygons.map((polygon) => {
      const totalWaste = Object.values(polygon.wasteCategories).reduce((sum, category) => {
        return sum + Object.values(category).reduce((catSum, value) => catSum + value, 0);
      }, 0);
  
      let categoryWaste = 0;
  
      if (selectedCategory === 'total') {
        categoryWaste = totalWaste; // Use total waste for percentage calculation
      } else if (polygon.wasteCategories[selectedCategory]) {
        categoryWaste = Object.values(polygon.wasteCategories[selectedCategory]).reduce(
          (catSum, value) => catSum + value,
          0
        );
      }
  
      const wastePercentage = totalWaste === 0 ? 0 : (categoryWaste / totalWaste) * 100;
  
      return { id: polygon.id, percentage: wastePercentage };
    });
  
    // Step 2: Sort polygons by percentage
    polygonPercentages.sort((a, b) => a.percentage - b.percentage);
  
    // Step 3: Divide polygons into three groups (33% each)
    const totalPolygons = polygonPercentages.length;
    const groupSize = Math.ceil(totalPolygons / 3);
  
    // Initialize ranges for legend
    let greenRange = { min: Infinity, max: -Infinity };
    let yellowRange = { min: Infinity, max: -Infinity };
    let redRange = { min: Infinity, max: -Infinity };
  
    polygonPercentages.forEach((polygon, index) => {
      if (index < groupSize) {
        newColors[polygon.id] = '#2ecc71'; // Green
        greenRange.min = Math.min(greenRange.min, polygon.percentage);
        greenRange.max = Math.max(greenRange.max, polygon.percentage);
      } else if (index < groupSize * 2) {
        newColors[polygon.id] = '#f1c40f'; // Yellow
        yellowRange.min = Math.min(yellowRange.min, polygon.percentage);
        yellowRange.max = Math.max(yellowRange.max, polygon.percentage);
      } else {
        newColors[polygon.id] = '#e74c3c'; // Red
        redRange.min = Math.min(redRange.min, polygon.percentage);
        redRange.max = Math.max(redRange.max, polygon.percentage);
      }
    });
  
    // Step 4: Update state
    setPolygonColors(newColors);
  
    // Step 5: Update legend
    updatedLegend.green = `Green: ${greenRange.min.toFixed(2)}tons - ${greenRange.max.toFixed(2)}tons`;
    updatedLegend.yellow = `Yellow: ${yellowRange.min.toFixed(2)}tons - ${yellowRange.max.toFixed(2)}tons`;
    updatedLegend.red = `Red: ${redRange.min.toFixed(2)}tons - ${redRange.max.toFixed(2)}tons`;
  
    setLegend(updatedLegend); 
  };
  
  
  

  

  const handlePolygonClick = (polygonData, event) => {
    setSelectedPolygon({ ...polygonData, position: event.latLng });
    setShowPieChart(false); // Hide pie chart when a new polygon is clicked
    
    // Set stable values
    //setPopulation(Math.floor(Math.random() * 10000) + 1000);
    //setHouseholds(Math.floor(Math.random() * 500) + 50);
    //setTotalWaste(Math.floor(Math.random() * 1000) + 100);
    //setWealthCategory(randomWealthCategory);
  };

  const handleCloseClick = () => setSelectedPolygon(null);
  const handleWasteClick = () => setShowPieChart(true);
  const handlePieChartClose = () => setShowPieChart(false);
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowPieChart(true); // Show the pie chart when category is changed
  };

  const calculateMainCategoryData = (wasteCategories) => {
    const mainCategories = {
      residential: 0,
      commercial: 0,
      industrial: 0,
      hazardous: 0,
    };
  
    Object.keys(wasteCategories).forEach(category => {
      const totalInCategory = Object.values(wasteCategories[category]).reduce((sum, value) => sum + value, 0);
      mainCategories[category] = totalInCategory;
    });
  
    return mainCategories;
  };
  
  const mainCategoryData = selectedPolygon ? calculateMainCategoryData(selectedPolygon.wasteCategories) : {};

  const mainPieChartData = {
    labels: Object.keys(mainCategoryData),
    datasets: [
      {
        label: 'Total Waste by Category',
        data: Object.values(mainCategoryData),
        backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f'],
        hoverBackgroundColor: ['#27ae60', '#2980b9', '#c0392b', '#f39c12'],
      },
    ],
  };
  
  
  const WasteTable = ({ wasteData }) => (
    <table className="waste-table">
      <thead>
        <tr>
          <th>Subcategory</th>
          <th>Amount (kg)</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(wasteData).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  

  const handleForecastClick = () => {
    if (!selectedPolygon) return; // Ensure a polygon is selected
  
    // Get the current population and design period (N)
    const presentPopulation = population; // From your existing state
    const designPeriod = forecastYear; // Use the selected year from the dropdown
  
    // Calculate future population
    const futurePopulation = Math.round(presentPopulation * Math.pow(1 + GROWTH_RATE, designPeriod));
  
    // Calculate total waste generated in future
    const totalWasteGenerated = Math.round(futurePopulation * WASTE_GENERATION_RATE * 365); // Multiply by 365 for annual waste
  
    // Update forecasted values for each category
    const newForecastedValues = {};
    Object.keys(selectedPolygon.wasteCategories).forEach((category) => {
      const wasteData = selectedPolygon.wasteCategories[category];
      const totalWasteInCategory = Object.values(wasteData).reduce((sum, value) => sum + value, 0);
  
      newForecastedValues[category] = {};
  
      // Set forecasted total waste for each waste subtype in the category
      Object.keys(wasteData).forEach((key) => {
        // Calculate the waste proportion based on the existing subtype value
        const subtypeWaste = Math.round((wasteData[key] / totalWasteInCategory) * totalWasteGenerated);
        newForecastedValues[category][key] = subtypeWaste;
      });
    });
  
    setForecastedValues(newForecastedValues); // Update state with the new forecasted values
  
    navigate('/forecast', { state: { forecastedValues: newForecastedValues, presentPopulation, forecastYear } });
  };
  
  
  const handleContourMap = () => {
  
  
    if (!selectedPolygon) {
      console.error("Selected polygon not found");
      return;
    }
  
    // Collect waste data for the selected polygon only
    const currentData = {
      wasteCategories: {
        residential: selectedPolygon.wasteCategories.residential,
        commercial: selectedPolygon.wasteCategories.commercial,
        industrial: selectedPolygon.wasteCategories.industrial,
        hazardous: selectedPolygon.wasteCategories.hazardous,
      },
    };
  
   // console.log("Current Waste Data",currentData)
    // Navigate to the heatmap page with the current data
    navigate('/heatmap', { state: currentData });
  };
  
  
  


  const handleComparison = () => {
    const id1 = parseInt(ucId1, 10);
    const id2 = parseInt(ucId2, 10);
    
    const polygon1 = polygons.find(p => p.id === id1 - 1);
    const polygon2 = polygons.find(p => p.id === id2 - 1);
    
    if (polygon1 && polygon2) {
      const results = {
        uc1: {
          population: Math.floor(Math.random() * 10000) + 1000, // Replace with actual data
          totalWaste: Math.floor(Math.random() * 1000) + 100, // Replace with actual data
          wasteCategories: polygon1.wasteCategories,
        },
        uc2: {
          population: Math.floor(Math.random() * 10000) + 1000, // Replace with actual data
          totalWaste: Math.floor(Math.random() * 1000) + 100, // Replace with actual data
          wasteCategories: polygon2.wasteCategories,
        },
      };
      setComparisonResults(results);
    } else {
      alert('Invalid UC IDs');
    }
  };


  const pieChartData = {
    labels: selectedPolygon ? Object.keys(selectedPolygon.wasteCategories[selectedCategory]) : [],
    datasets: [
      {
        label: 'Waste',
        data: selectedPolygon ? Object.values(selectedPolygon.wasteCategories[selectedCategory]) : [],
        backgroundColor: [
          '#2ecc71', '#3498db', '#e74c3c', '#f1c40f',
          '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
          '#e84393', '#f368e0', '#74b9ff', '#55efc4'
        ],
        hoverBackgroundColor: [
          '#27ae60', '#2980b9', '#c0392b', '#f39c12',
          '#8e44ad', '#16a085', '#2c3e50', '#d35400',
          '#d63031', '#fd79a8', '#0984e3', '#00b894'
        ]
      }
    ]
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyClURLc6gcn9M_AOXj6gUsYYk147-T_FDA" libraries={libraries}>

<select onChange={(e) => handlePolygonColorChange(e.target.value)}>
  <option value="total">Total Waste</option>
  <option value="residential">Residential Waste</option>
  <option value="industrial">Industrial Waste</option>
  <option value="commercial">Commercial Waste</option>
  <option value="hazardous">Hazardous Waste</option>
</select>

<select onChange={(e) => handleViewChange(e.target.value)} style={{ position: 'absolute', top: '0px', left: '620px', zIndex: 2 }}>
          <option value="district">Districts</option>
          <option value="unionCouncil">Union Councils</option>
          <option value="province">Provinces</option>
        </select>
        <div>
  <h4>Legend</h4>
  <p>
    <span style={{ color: '#2ecc71' }}>■</span> {legend.green}
  </p>
  <p>
    <span style={{ color: '#f1c40f' }}>■</span> {legend.yellow}
  </p>
  <p>
    <span style={{ color: '#e74c3c' }}>■</span> {legend.red}
  </p>
</div>


        <div style={{ position: 'absolute', top: '0px', left: '420px', zIndex: 2 }}>
    <button onClick={handleToggleComparisonInputs}>
      {showComparisonInputs ? 'Hide UC Comparison' : 'Show UC Comparison'}
    </button>

    {showComparisonInputs && (
      <div style={{ marginTop: '10px' }}>
        <input 
          type="number" 
          placeholder="Enter UC ID 1" 
          value={ucId1} 
          onChange={(e) => setUcId1(e.target.value)} 
          style={{ marginRight: '10px' }} 
        />
        <input 
          type="number" 
          placeholder="Enter UC ID 2" 
          value={ucId2} 
          onChange={(e) => setUcId2(e.target.value)} 
          style={{ marginRight: '10px' }} 
        />
        <button onClick={handleComparison}>Compare</button>
      </div>
    )}
  </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        key={mapKey} // Use key to force remount
        onLoad={onLoad}
        options={options}
      >

                {/* Integrate the MapSearch component */}
                <MapSearch onLocationSelect={handleLocationSelect} />
        {polygons.map((polygon, index) => (
          <Polygon
            key={index}
            options={{
              ...polygon.options,
              fillColor: polygonColors[polygon.id] || polygon.options.fillColor, // Use the updated color
            }}

            paths={polygon.paths}
            onClick={(event) => handlePolygonClick(polygon, event)}
          />
        ))}
        {selectedPolygon && (
          <>
            <InfoWindow position={selectedPolygon.position} onCloseClick={handleCloseClick}>
              <div style={infoWindowStyle}>
                
                <div style={titleStyle}>{`UC ${selectedPolygon.id + 1}`}</div>
                <div style={labelStyle}><span style={iconStyle}>🏷️</span>City ID:</div>
                <div style={valueStyle}>{`UC${selectedPolygon.id + 1}`}</div>
                <div style={labelStyle}><span style={iconStyle}>👨‍👩‍👧‍👦</span>Population:</div>
                <div style={valueStyle}>{population}</div>
                <div style={labelStyle}><span style={iconStyle}>🏙️</span>City:</div>
                <div style={valueStyle}>{selectedPolygon.DISTRICT}</div> {/* Display the city here */}
                <div style={labelStyle}><span style={iconStyle}>🏠</span>Households:</div>
                <div style={valueStyle}>{households}</div>
                <div style={labelStyle}><span style={iconStyle}>💰</span>Wealth Category:</div>
                <div style={valueStyle}>{wealthCategory}</div>
                <div style={labelStyle}><span style={iconStyle}>♻️</span>Total Waste Generated:</div>
                <div style={valueStyle} onClick={handleWasteClick}>
                  {totalWaste} Tons
                </div>
                                              {/* Main Categories Pie Chart */}
              <div style={{marginBottom:'30px', width: '400px', height: '300px' }}>
                <h3>Main Waste Categories</h3>
                <Pie data={mainPieChartData} />
              </div>


                <div>
                  <button className="styled-button" onClick={() => handleCategoryChange('residential')}>Residential</button>
                  <button className="styled-button" onClick={() => handleCategoryChange('commercial')}>Commercial</button>
                  <button className="styled-button" onClick={() => handleCategoryChange('industrial')}>Industrial</button>
                  <button className="styled-button" onClick={() => handleCategoryChange('hazardous')}>Hazardous</button>
                </div>

                            {/* Show the Subcategories Table */}
                            <div>
                <h3>Subcategories</h3>
                <WasteTable wasteData={selectedPolygon.wasteCategories[selectedCategory]} />
              </div>
                {/* New Forecast Section */}
                <div className="forecast-section">
                  
                  <select className="year-dropdown" value={forecastYear} onChange={(e) => setForecastYear(Number(e.target.value))}>
                    {[...Array(10)].map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                         {index + 1} Year
                      </option>
                    ))}
                  </select>
                  <button className="forecast-button" onClick={handleForecastClick}>Forecast</button>
                  <button className="forecast-button" onClick={handleContourMap}>Carbon Footprint Analysis</button>
                 
          
                </div>
              </div>
            </InfoWindow>
            {showPieChart && (
              <InfoWindow position={selectedPolygon.position} onCloseClick={handlePieChartClose}>
                <div style={pieChartStyle}>
                  <Pie data={pieChartData} />
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
      {/* Comparison Results Display */}
{comparisonResults && (
  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2, backgroundColor: '#fff', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '300px' }}>
    <h3>Comparison Results</h3>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Union Council</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Population</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Waste Categories</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>UC {ucId1}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{comparisonResults.uc1.population}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{JSON.stringify(comparisonResults.uc1.wasteCategories)}</td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>UC {ucId2}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{comparisonResults.uc2.population}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{JSON.stringify(comparisonResults.uc2.wasteCategories)}</td>
        </tr>
      </tbody>
    </table>
  </div>
)}

    </LoadScript>
  );
};

export default GeneateMap;
