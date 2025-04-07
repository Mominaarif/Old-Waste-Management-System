import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const NextPage = () => {
  const location = useLocation();
  const { calculatedData, totals } = location.state || {};

  const [selectedWasteTypes, setSelectedWasteTypes] = useState({});
  const [wasteCategories, setWasteCategories] = useState({});
  const [customEmissionFactors, setCustomEmissionFactors] = useState({});

  const [showSummary, setShowSummary] = useState(false);
  const [categoryDisposalMethods, setCategoryDisposalMethods] = useState({
    Biodegradable: [],
    Combustible: [],
    Recyclable: [],
    Residual: [],
  });
  const [carbonFootprint, setCarbonFootprint] = useState({});
  const [leastCo2Methods, setLeastCo2Methods] = useState({});
  const [showLeastCo2Table, setShowLeastCo2Table] = useState(false);

  const disposalOptions = {
    Biodegradable: [
      "Composting",
      "Anaerobic Digestion",
      "Landfilling with LGR",
      "Landfilling without LGR",
      "MBT",
    ],
    Combustible: [
      "RDF",
      "Incineration",
      "Landfilling with LGR",
      "Landfilling without LGR",
      "Pyrolysis",
      "Gasification",
    ],
    Recyclable: [
      "Physical Recycling",
      "Chemical Recycling",
      "Landfilling with LGR",
      "Landfilling without LGR",
    ],
    Residual: ["Landfilling with LGR", "Landfilling without LGR"],
  };

  const subcategories = {
    "Anaerobic Digestion": [
      "Dry Digestion",
      "Wet Digestion",
      "Batch Digestion",
      "Continuous Digestion",
    ],
    Composting: [
      "Aerated Static Pile Composting",
      "Windrow Composting",
      "In-vessel Composting",
    ],
    "Mechanical Biological Treatment (MBT)": [
      "Biostabilization",
      "Bio-drying",
    ],
    "Landfilling with LGR": [
      "Sanitary Landfilling",
      "Bioreactor Landfills",
    ],
    RDF: ["Low-Density RDF", "High-Density RDF"],
    Incineration: ["Mass Burn", "Fluidized Bed"],
    Pyrolysis: ["Fast Pyrolysis", "Slow Pyrolysis"],
    Gasification: [
      "Plasma Arc Gasification",
      "Fixed Bed Gasification",
      "Fluidized Bed Gasification",
    ],
    "Chemical Recycling": ["Depolymerization", "Solvolysis"],
    "Physical Recycling": ["Shredding and Re-molding", "Mechanical Separation"],
  };

  const carbonEmissionFactors = {
    Composting: 0.1,
    "Anaerobic Digestion": 0.05,
    "Landfilling with LGR": 0.3,
    "Landfilling without LGR": 0.6,
    MBT: 0.15,
    RDF: 0.4,
    Incineration: 0.7,
    Pyrolysis: 0.2,
    Gasification: 0.25,
    "Physical Recycling": 0.08,
    "Chemical Recycling": 0.12,
    "Dry Digestion": 0.04,
    "Wet Digestion": 0.05,
    "Batch Digestion": 0.06,
    "Continuous Digestion": 0.03,
    "Aerated Static Pile Composting": 0.12,
    "Windrow Composting": 0.1,
    "In-vessel Composting": 0.08,
    "Biostabilization": 0.18,
    "Bio-drying": 0.2,
    "Sanitary Landfilling": 0.35,
    "Bioreactor Landfills": 0.28,
    "Low-Density RDF": 0.35,
    "High-Density RDF": 0.45,
    "Mass Burn": 0.8,
    "Fluidized Bed": 0.75,
    "Fast Pyrolysis": 0.25,
    "Slow Pyrolysis": 0.3,
    "Plasma Arc Gasification": 0.22,
    "Fixed Bed Gasification": 0.2,
    "Fluidized Bed Gasification": 0.18,
    "Depolymerization": 0.13,
    "Solvolysis": 0.15,
    "Shredding and Re-molding": 0.06,
    "Mechanical Separation": 0.05,
  };

  useEffect(() => {
    setSelectedWasteTypes(
      Object.keys(calculatedData).reduce((selected, wasteType) => {
        selected[wasteType] = true;
        return selected;
      }, {})
    );
    setWasteCategories(
      Object.keys(calculatedData).reduce((categories, wasteType) => {
        categories[wasteType] = "Biodegradable";
        return categories;
      }, {})
    );
  }, [calculatedData]);


  const handleCustomEmissionFactorChange = (method, value) => {
    setCustomEmissionFactors((prevFactors) => ({
      ...prevFactors,
      [method]: value ? parseFloat(value) : null,
    }));
  };
  
  
  const handleDisposalMethodChange = (category, method, subMethod) => {
    setCategoryDisposalMethods((prevMethods) => {
      const updatedMethods = prevMethods[category] || [];
      const methodKey = subMethod ? `${method} - ${subMethod}` : method;
      const isSelected = updatedMethods.includes(methodKey);
      const newMethods = isSelected
        ? updatedMethods.filter((m) => m !== methodKey)
        : [...updatedMethods, methodKey];
      return { ...prevMethods, [category]: newMethods };
    });
  };

  const calculateCarbonFootprint = () => {
    const newCarbonFootprint = {};
  
    Object.keys(categoryDisposalMethods).forEach((category) => {
      const subcategoriesData = calculatedData[category.toLowerCase()] || {};
      const categoryMethods = categoryDisposalMethods[category] || [];
  
      newCarbonFootprint[category] = categoryMethods.reduce((footprintByMethod, method) => {
        const methodFootprint = Object.keys(subcategoriesData).reduce((total, subcategory) => {
          const wasteAmount = subcategoriesData[subcategory] || 0;
          const emissionFactor = customEmissionFactors[method] || carbonEmissionFactors[method] || 1;
          return total + wasteAmount * emissionFactor;
        }, 0);
        footprintByMethod[method] = methodFootprint;
        return footprintByMethod;
      }, {});
    });
  
    setCarbonFootprint(newCarbonFootprint);
    setShowSummary(true);
  };
  

  const computeLeastCo2Methods = () => {
    const leastMethods = {};

    Object.keys(carbonFootprint).forEach((category) => {
      const methods = carbonFootprint[category] || {};
      const leastMethod = Object.entries(methods).reduce(
        (least, [method, footprint]) =>
          !least || footprint < least.footprint ? { method, footprint } : least,
        null
      );
      leastMethods[category] = leastMethod;
    });

    setLeastCo2Methods(leastMethods);
    setShowLeastCo2Table(true);
  };

  const renderTableAndChart = (category) => {
    const tableData = carbonFootprint[category] || {};

    const chartData = {
      labels: Object.keys(tableData),
      datasets: [
        {
          label: `${category} Carbon Footprint (kg CO₂)`,
          data: Object.values(tableData),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // Teal
            'rgba(255, 99, 132, 0.6)', // Red
            'rgba(54, 162, 235, 0.6)', // Blue
            'rgba(255, 206, 86, 0.6)', // Yellow
            'rgba(153, 102, 255, 0.6)', // Purple
            'rgba(255, 159, 64, 0.6)', // Orange
            'rgba(0, 200, 83, 0.6)', // Green
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)', 
            'rgba(255, 99, 132, 1)', 
            'rgba(54, 162, 235, 1)', 
            'rgba(255, 206, 86, 1)', 
            'rgba(153, 102, 255, 1)', 
            'rgba(255, 159, 64, 1)', 
            'rgba(0, 200, 83, 1)', 
          ],
          borderWidth: 1,
        },
      ],
    };

    return (
      <div>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Method</th>
              <th>Carbon Footprint (kg CO₂)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(tableData).map((method) => (
              <tr key={method}>
                <td>{method}</td>
                <td>{tableData[method].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ width: '50%' }}>
          <Bar data={chartData} />
        </div>
      </div>
    );
  };

  if (!calculatedData || !totals) {
    return <div>Data not available</div>;
  }

  return (
    <div style={{ padding: '20px', maxHeight: '100vh', overflowY: 'auto' }}>

  <section>
    <h2>Select Management Technologies Method for Each Category</h2>
    <table border="1" cellPadding="8" cellSpacing="0">
      <thead>
        <tr>
          {Object.keys(disposalOptions).map((category) => (
            <th key={category} style={{ textAlign: 'center' }}>
              {category}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({
          length: Math.max(
            ...Object.values(disposalOptions).map((methods) => methods.length)
          ),
        }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Object.keys(disposalOptions).map((category) => (
              <td key={category} style={{ textAlign: 'center' }}>
                {disposalOptions[category][rowIndex] ? (
                  <div>
                    {subcategories[disposalOptions[category][rowIndex]] ? (
                      <div>
                        <label>{disposalOptions[category][rowIndex]}</label>
                        {subcategories[disposalOptions[category][rowIndex]].map(
                          (subMethod) => {
                            const methodKey = `${disposalOptions[category][rowIndex]} - ${subMethod}`;
                            const isChecked = categoryDisposalMethods[category]?.includes(methodKey) || false;
                            return (
                              <div key={subMethod} style={{ marginLeft: '20px' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleDisposalMethodChange(category, disposalOptions[category][rowIndex], subMethod)
                                  }
                                />
                                <label>{subMethod}</label>
                                
                                {/* Show input only if the checkbox is checked */}
                                {isChecked && (
                                  <div style={{ marginTop: '5px' }}>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Enter emission factor"
                                      value={customEmissionFactors[methodKey] || ''}
                                      onChange={(e) =>
                                        handleCustomEmissionFactorChange(methodKey, e.target.value)
                                      }
                                      style={{ marginLeft: '10px' }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="checkbox"
                          checked={
                            categoryDisposalMethods[category]?.includes(disposalOptions[category][rowIndex]) || false
                          }
                          onChange={() =>
                            handleDisposalMethodChange(category, disposalOptions[category][rowIndex])
                          }
                        />
                        <label>{disposalOptions[category][rowIndex]}</label>
                        
                        {/* Show input only if the checkbox is checked */}
                        {categoryDisposalMethods[category]?.includes(disposalOptions[category][rowIndex]) && (
                          <div style={{ marginTop: '5px' }}>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Enter emission factor"
                              value={customEmissionFactors[disposalOptions[category][rowIndex]] || ''}
                              onChange={(e) =>
                                handleCustomEmissionFactorChange(disposalOptions[category][rowIndex], e.target.value)
                              }
                              style={{ marginLeft: '10px' }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </section>



  
  
      <button style={{ marginTop: '20px' }} onClick={calculateCarbonFootprint}>
        Calculate Carbon Footprint
      </button>

      {showSummary && (
        <div style={{ marginTop: '40px' }}>
          <h2>Carbon Footprint Summary</h2>
          {Object.keys(carbonFootprint).map((category) => (
            <div key={category}>
              <h3>{category}</h3>
              {renderTableAndChart(category)}
            </div>
          ))}
          <button
            style={{ marginTop: '20px' }}
            onClick={computeLeastCo2Methods}
          >
           Show Least CO₂ Management Technologies
          </button>
        </div>
      )}

      {showLeastCo2Table && (
        <div style={{ marginTop: '40px' }}>
          <h2>Least CO₂ Management Technologies </h2>
          <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Method</th>
                <th>Carbon Footprint (kg CO₂)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(leastCo2Methods).map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{leastCo2Methods[category]?.method || "N/A"}</td>
                  <td>
                    {leastCo2Methods[category]?.footprint?.toFixed(2) || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NextPage;
