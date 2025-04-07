import React, { useEffect, useRef, useState } from 'react';

const paragraphStyle = {
  fontFamily: 'Open Sans',
  margin: 0,
  fontSize: 13,
};

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
    wealthy: false,
    wasteCategories: {
      Residential : { checked: false, subcategories: { food: { checked: false, value: '' }, garden: { checked: false, value: '' } } },
      Commercial: { checked: false, subcategories: { metal: { checked: false, value: '' }, plastic: { checked: false, value: '' } } },
      hazardous: { checked: false, subcategories: { chemicals: { checked: false, value: '' }, batteries: { checked: false, value: '' } } },
    },
  });

  useEffect(() => {
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAo_mqWaTaovIAeSAUFCI9lBNNIwxx6_bE&libraries=drawing,geometry`;
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

            // Disable further drawing
            drawingManager.setOptions({
              drawingMode: null,
              drawingControl: false,
            });

            // Make the polygon non-editable and non-draggable
            polygon.setOptions({
              editable: false,
              draggable: false,
            });

            setIsPolygonDrawn(true);

            // Add click event listener to the polygon
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
        // Handle main category checkbox
        setFormData((prevData) => ({
          ...prevData,
          wasteCategories: {
            ...prevData.wasteCategories,
            [name]: { ...prevData.wasteCategories[name], checked },
          },
        }));
      } else {
        // Handle subcategory checkbox
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
      // Handle subcategory value
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

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form Data:', formData);

    // Show the UC Name label on the map
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div><strong>${formData.ucName}</strong></div>`,
      position: selectedPolygon.getPath().getAt(0),
    });

    infoWindow.open(mapRef.current);
    
    // Reset the form after submission
    if (selectedPolygon) {
      selectedPolygon.setMap(null);
    }
    setSelectedPolygon(null);
    setFormData({
      ucName: '',
      population: '',
      households: '',
      wealthy: false,
      wasteCategories: {
        organic: { checked: false, subcategories: { food: { checked: false, value: '' }, garden: { checked: false, value: '' } } },
        inorganic: { checked: false, subcategories: { metal: { checked: false, value: '' }, plastic: { checked: false, value: '' } } },
        hazardous: { checked: false, subcategories: { chemicals: { checked: false, value: '' }, batteries: { checked: false, value: '' } } },
      },
    });
  };

  return (
    <>
      <div ref={mapContainerRef} id="map" style={{ height: '100%' }}></div>
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
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h3>Enter Details</h3>
          <form>
            <label style={formLabelStyle}>
              UC Name:
              <input
                type="text"
                name="ucName"
                value={formData.ucName}
                onChange={handleFormChange}
                style={inputStyle}
              />
            </label>
            <label style={formLabelStyle}>
              Population:
              <input
                type="number"
                name="population"
                value={formData.population}
                onChange={handleFormChange}
                style={inputStyle}
              />
            </label>
            <label style={formLabelStyle}>
              Households:
              <input
                type="number"
                name="households"
                value={formData.households}
                onChange={handleFormChange}
                style={inputStyle}
              />
            </label>
            <label>
              <input
                type="checkbox"
                name="wealthy"
                checked={formData.wealthy}
                onChange={handleFormChange}
                style={checkboxStyle}
              />
              Wealthy Area
            </label>
            <fieldset style={{ marginTop: '15px' }}>
              <legend>Waste Categories:</legend>
              {Object.keys(formData.wasteCategories).map((mainCategory) => (
                <div key={mainCategory}>
                  <label>
                    <input
                      type="checkbox"
                      name={mainCategory}
                      checked={formData.wasteCategories[mainCategory].checked}
                      onChange={handleFormChange}
                      style={checkboxStyle}
                    />
                    {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}
                  </label>
                  {formData.wasteCategories[mainCategory].checked && (
                    <div style={{ marginLeft: '20px' }}>
                      {Object.keys(formData.wasteCategories[mainCategory].subcategories).map((subCategory) => (
                        <div key={subCategory}>
                          <label>
                            <input
                              type="checkbox"
                              name={`${mainCategory}_${subCategory}`}
                              checked={formData.wasteCategories[mainCategory].subcategories[subCategory].checked}
                              onChange={handleFormChange}
                              style={checkboxStyle}
                            />
                            {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                            {formData.wasteCategories[mainCategory].subcategories[subCategory].checked && (
                              <input
                                type="number"
                                name={`${mainCategory}_${subCategory}Value`}
                                placeholder="Value"
                                value={formData.wasteCategories[mainCategory].subcategories[subCategory].value}
                                onChange={handleFormChange}
                                style={inputStyle}
                              />
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </fieldset>
            <button type="button" onClick={handleSubmit} style={submitButtonStyle}>
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Map2;







//googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAo_mqWaTaovIAeSAUFCI9lBNNIwxx6_bE&libraries=drawing,geometry`;