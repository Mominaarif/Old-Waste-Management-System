import React, { useEffect, useRef, useState } from 'react';
import MapSearch from './MapSearch';

import { doc, setDoc } from "firebase/firestore"; // For Firestore functions
import { db } from "../firebase"; // Import your Firebase configuration file
import { getAuth } from "firebase/auth";



const paragraphStyle = {
  fontFamily: 'Open Sans',
  margin: 0,
  fontSize: 13,
};

const containerStyle = {
  width: "calc(100% + (350px))",
  height: "100vh",
  top: "0",
  left: "-180px",
  border: "2px solid #73AD21",  
  zIndex: 1,
  boxSizing: "border-box",
};
const formLabelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  margin: '5px 0 15px 0',
  display: 'inline-block',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const selectStyle = {
  width: '100%',
  padding: '8px',
  margin: '5px 0 15px 0',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px',
};

const checkboxStyle = {
  marginRight: '10px',
};

const submitButtonStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  width: '100%',
  fontSize: '16px',
};



const Map2 = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawingManagerRef = useRef();
  const [roundedArea, setRoundedArea] = useState();
  const [isPolygonDrawn, setIsPolygonDrawn] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [formData, setFormData] = useState({
    ucName: '',
    population: '',
    households: '',
    incomeGroup: '', 
    wasteCategories: {
      Residential: {
        checked: false,
        subcategories: {
          Paper: { checked: false, value: '' },
          Cardboard: { checked: false, value: '' },
          LightPlastic: { checked: false, value: '' },
          DensePlastic: { checked: false, value: '' },
          TextileWaste: { checked: false, value: '' },
          FoodWaste: { checked: false, value: '' },
          YardWaste: { checked: false, value: '' },
          Metals: { checked: false, value: '' },
          Glass: { checked: false, value: '' },
          Diapers: { checked: false, value: '' },
          AnimalDunk: { checked: false, value: '' },
          Wood: { checked: false, value: '' },
          Electronic: { checked: false, value: '' },
          Leather: { checked: false, value: '' },
          CDWaste: { checked: false, value: '' }, // Construction and Demolition Waste
        }
      },
      Commercial: {
        checked: false,
        subcategories: {
          Paper: { checked: false, value: '' },
          Cardboard: { checked: false, value: '' },
          LightPlastic: { checked: false, value: '' },
          DensePlastic: { checked: false, value: '' },
          TextileWaste: { checked: false, value: '' },
          FoodWaste: { checked: false, value: '' },
          YardWaste: { checked: false, value: '' },
          Metals: { checked: false, value: '' },
          Glass: { checked: false, value: '' },
          Diapers: { checked: false, value: '' },
          AnimalDunk: { checked: false, value: '' },
          Wood: { checked: false, value: '' },
          Electronic: { checked: false, value: '' },
          Leather: { checked: false, value: '' },
          CDWaste: { checked: false, value: '' },
        }
      },
      Industrial: {
        checked: false,
        subcategories: {
          Paper: { checked: false, value: '' },
          Cardboard: { checked: false, value: '' },
          LightPlastic: { checked: false, value: '' },
          DensePlastic: { checked: false, value: '' },
          TextileWaste: { checked: false, value: '' },
          FoodWaste: { checked: false, value: '' },
          YardWaste: { checked: false, value: '' },
          Metals: { checked: false, value: '' },
          Glass: { checked: false, value: '' },
          Diapers: { checked: false, value: '' },
          AnimalDunk: { checked: false, value: '' },
          Wood: { checked: false, value: '' },
          Electronic: { checked: false, value: '' },
          Leather: { checked: false, value: '' },
          CDWaste: { checked: false, value: '' },
        }
      },
      Hazardous: {
        checked: false,
        subcategories: {
          Needles: { checked: false, value: '' },
          Syringes: { checked: false, value: '' },
          Scalpels: { checked: false, value: '' },
          InfusionSets: { checked: false, value: '' },
          SawsKnives: { checked: false, value: '' },
          Blades: { checked: false, value: '' },
          Chemicals: { checked: false, value: '' },
        }
      }
    },
  });

  useEffect(() => {
    const googleMapsScript = document.createElement('script');
    
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyClURLc6gcn9M_AOXj6gUsYYk147-T_FDA&libraries=drawing,geometry`;
    window.document.head.appendChild(googleMapsScript);

    googleMapsScript.addEventListener('load', () => {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 31.5204, lng: 74.3587 },
        zoom: 12,
        mapTypeId: 'satellite',
      });

      mapRef.current = map;

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon'],
        },
        polygonOptions: {
          editable: false,
          draggable: false,
        },
      });

      drawingManagerRef.current = drawingManager;

      drawingManager.setMap(map);

      window.google.maps.event.addListener(
        drawingManager,
        'overlaycomplete',
        (event) => {
          if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
            const polygon = event.overlay;
            calculateArea(polygon);

            drawingManager.setOptions({
              drawingMode: null,
              drawingControl: false,
            });

            polygon.setOptions({
              editable: false,
              draggable: false,
            });

            setIsPolygonDrawn(true);

            window.google.maps.event.addListener(polygon, 'click', () => {
              setSelectedPolygon(polygon);
            });

            window.google.maps.event.addListener(polygon.getPath(), 'set_at', () => calculateArea(polygon));
            window.google.maps.event.addListener(polygon.getPath(), 'insert_at', () => calculateArea(polygon));
          }
        }
      );
    });

    function calculateArea(polygon) {
      const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
      setRoundedArea(Math.round(area * 100) / 100);
    }
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (Object.keys(formData.wasteCategories).includes(name)) {
        setFormData((prevData) => ({
          ...prevData,
          wasteCategories: {
            ...prevData.wasteCategories,
            [name]: { ...prevData.wasteCategories[name], checked },
          },
        }));
      } else {
        const [mainCategory, subCategory] = name.split('_');
        setFormData((prevData) => ({
          ...prevData,
          wasteCategories: {
            ...prevData.wasteCategories,
            [mainCategory]: {
              ...prevData.wasteCategories[mainCategory],
              subcategories: {
                ...prevData.wasteCategories[mainCategory].subcategories,
                [subCategory]: { ...prevData.wasteCategories[mainCategory].subcategories[subCategory], checked },
              },
            },
          },
        }));
      }
    } else if (name.includes('Value')) {
      const [mainCategory, subCategory] = name.split('Value')[0].split('_');
      setFormData((prevData) => ({
        ...prevData,
        wasteCategories: {
          ...prevData.wasteCategories,
          [mainCategory]: {
            ...prevData.wasteCategories[mainCategory],
            subcategories: {
              ...prevData.wasteCategories[mainCategory].subcategories,
              [subCategory]: { ...prevData.wasteCategories[mainCategory].subcategories[subCategory], value },
            },
          },
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('Form Data:', formData);
        // Get the currently logged-in user
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            alert("No user logged in!");
            return;
        }
    
        const userUID = user.uid; // Capture user UID
        const userEmail = user.email; 

        if (!selectedPolygon) {
          alert("Please draw a polygon on the map before submitting.");
          return;
      }
  
      // Extract polygon coordinates
      const polygonCoordinates = selectedPolygon.getPath().getArray().map(coord => ({
          lat: coord.lat(),
          lng: coord.lng()
      }));

    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div><strong>${formData.ucName}</strong></div>`,
      position: selectedPolygon.getPath().getAt(0),
    });

    infoWindow.open(mapRef.current);

    if (selectedPolygon) {
      selectedPolygon.setMap(null);
    }
    setSelectedPolygon(null);

    try {
      // Save data to Firestore
      const docRef = doc(db, "wasteData", formData.ucName); // Collection: wasteData, Document: ucName
      await setDoc(docRef, {
          ...formData,
          userUID: userUID,
          userEmail: userEmail,
          polygonCoordinates: polygonCoordinates
      });

      console.log("Data saved to Firestore successfully!");
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }

    setFormData({
      ucName: '',
      population: '',
      households: '',
      incomeGroup: '', 
      wasteCategories: {
        Residential: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' }, // Construction and Demolition Waste
          }
        },
        Commercial: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' },
          }
        },
        Industrial: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' },
          }
        },
        Hazardous: {
          checked: false,
          subcategories: {
            Needles: { checked: false, value: '' },
            Syringes: { checked: false, value: '' },
            Scalpels: { checked: false, value: '' },
            InfusionSets: { checked: false, value: '' },
            SawsKnives: { checked: false, value: '' },
            Blades: { checked: false, value: '' },
            Chemicals: { checked: false, value: '' },
          }
        }
      },
    });
  };

 

  const handleLocationSelect = (location) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(12);
    }
  };
  return (
    <>
      <div ref={mapContainerRef} id="map" style={{ height: '100%' , width:'100%'}}></div>
      


     
      <div
        className="calculation-box"
        style={{
          height: 75,
          width: 150,
          position: 'absolute',
          bottom: 40,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          textAlign: 'center',
        }}
      >
        <p style={paragraphStyle}>Click the map to draw a polygon.</p>
        <div id="calculated-area">
          {roundedArea && (
            <>
              <p style={paragraphStyle}>
                <strong>{roundedArea}</strong>
              </p>
              <p style={paragraphStyle}>square meters</p>
            </>
          )}
        </div>
      </div>
      {selectedPolygon && (
        <div
          className="form-box"
          style={{
            position: 'absolute',
            bottom: 120,
            left: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 15,
            width: 300,
            zIndex: 1,
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <h2>Polygon Details</h2>

          <label style={formLabelStyle} htmlFor="ucName">UC Name</label>
          <input
            type="text"
            id="ucName"
            name="ucName"
            style={inputStyle}
            value={formData.ucName}
            onChange={handleFormChange}
          />

          <label style={formLabelStyle} htmlFor="population">Population</label>
          <input
            type="text"
            id="population"
            name="population"
            style={inputStyle}
            value={formData.population}
            onChange={handleFormChange}
          />

          <label style={formLabelStyle} htmlFor="households">Households</label>
          <input
            type="text"
            id="households"
            name="households"
            style={inputStyle}
            value={formData.households}
            onChange={handleFormChange}
          />

          {/* Dropdown for Income Group */}
          <label style={formLabelStyle} htmlFor="incomeGroup">Income Group</label>
          <select
            id="incomeGroup"
            name="incomeGroup"
            style={selectStyle}
            value={formData.incomeGroup}
            onChange={handleFormChange}
          >
            <option value="">Select Income Group</option>
            <option value="High Income Group">High Income Group</option>
            <option value="Higher-Middle Income Group">Higher-Middle Income Group</option>
            <option value="Lower-Middle Income Group">Lower-Middle Income Group</option>
            <option value="Low Income Group">Low Income Group</option>
          </select>

          <h3>Waste Categories</h3>

          {Object.entries(formData.wasteCategories).map(([categoryName, categoryData]) => (
            <div key={categoryName}>
              <label>
                <input
                  type="checkbox"
                  name={categoryName}
                  style={checkboxStyle}
                  checked={categoryData.checked}
                  onChange={handleFormChange}
                />
                {categoryName}
              </label>

              {categoryData.checked &&
                Object.entries(categoryData.subcategories).map(([subcategoryName, subcategoryData]) => (
                  <div key={`${categoryName}_${subcategoryName}`}>
                    <label>
                      <input
                        type="checkbox"
                        name={`${categoryName}_${subcategoryName}`}
                        style={checkboxStyle}
                        checked={subcategoryData.checked}
                        onChange={handleFormChange}
                      />
                      {subcategoryName}
                    </label>

                    {subcategoryData.checked && (
                      <input
                        type="text"
                        name={`${categoryName}_${subcategoryName}Value`}
                        style={inputStyle}
                        placeholder={`Enter value for ${subcategoryName}`}
                        value={subcategoryData.value}
                        onChange={handleFormChange}
                      />
                    )}
                  </div>
                ))}
            </div>
          ))}

          <button style={submitButtonStyle} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default Map2;








//googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAo_mqWaTaovIAeSAUFCI9lBNNIwxx6_bE&libraries=drawing,geometry`;