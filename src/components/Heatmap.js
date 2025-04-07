import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import './Heatmap.css';

const CarbonFootprint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wasteData = location.state.wasteCategories;

  const [combinedWasteData, setCombinedWasteData] = useState({});
  const [disposalMethods, setDisposalMethods] = useState({});
  const [selectedWasteTypes, setSelectedWasteTypes] = useState({
    biodegradable: { foodWaste: 0, yardWaste: 0, animalDunk: 0, paper: 0, cardboard: 0, textile: 0 },
    combustible: { paper: 0, cardboard: 0, lightPlastic: 0, densePlastic: 0, textile: 0, foodWaste: 0, yardWaste: 0, wood: 0, leather: 0, diapers: 0 },
    recyclable: { paper: 0, leather: 0, cardboard: 0, lightPlastic: 0, densePlastic: 0, metals: 0, glass: 0, electronic: 0, textile: 0, cdWaste: 0, diapers: 0 },
  });
  const [enabledWasteTypes, setEnabledWasteTypes] = useState({
    biodegradable: {},
    combustible: {},
    recyclable: {}
  });
  const [calculatedData, setCalculatedData] = useState({
    biodegradable: {},
    combustible: {},
    recyclable: {},
    residual: {},
  });
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);  // State for controlling chart visibility
  const [showModal, setShowModal] = useState(false);  // State for controlling modal visibility

  const biodegradableWaste = ['foodWaste', 'yardWaste', 'animalDunk', 'paper', 'cardboard', 'textile'];
  const combustibleWaste = ['paper', 'cardboard', 'lightPlastic', 'densePlastic', 'textile', 'foodWaste', 'yardWaste', 'wood', 'leather', 'diapers'];
  const recyclableWaste = ['paper', 'leather', 'cardboard', 'lightPlastic', 'densePlastic', 'metals', 'glass', 'electronic', 'textile', 'cdWaste', 'diapers'];

  useEffect(() => {
    const combinedData = {};

    Object.values(wasteData).forEach((categoryData) => {
      Object.entries(categoryData).forEach(([wasteType, amount]) => {
        combinedData[wasteType] = (combinedData[wasteType] || 0) + amount;
      });
    });

    setCombinedWasteData(combinedData);
    setDisposalMethods(
      Object.keys(combinedData).reduce((methods, wasteType) => {
        methods[wasteType] = 'Landfill';
        return methods;
      }, {})
    );
  }, [wasteData]);

  const chartData = {
    labels: ['Biodegradable', 'Combustible', 'Recyclable', 'Residual'],
    datasets: [
      {
        label: 'Waste (Kg)',
        data: [
          Object.values(calculatedData.biodegradable).reduce((sum, value) => sum + value, 0),
          Object.values(calculatedData.combustible).reduce((sum, value) => sum + value, 0),
          Object.values(calculatedData.recyclable).reduce((sum, value) => sum + value, 0),
          Object.values(calculatedData.residual).reduce((sum, value) => sum + value, 0),
        ],
        backgroundColor: ['#76c893', '#ff7f50', '#6495ed', '#d5d5d5'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const handlePercentageChange = (category, wasteType, percentage) => {
    if (percentage < 0 || percentage > 100) {
      setError('Percentage must be between 0 and 100');
      return;
    }

    const totalPercentage = Object.values(selectedWasteTypes).reduce((total, categoryData) => {
      return total + (categoryData[wasteType] || 0);
    }, 0);

    if (totalPercentage >= 100) {
      setError('Total percentage for this waste type exceeds 100%. Please adjust the values.');
    } else {
      setError(null);
      setSelectedWasteTypes((prevState) => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          [wasteType]: percentage,
        },
      }));
    }
  };

  const handleCheckboxChange = (category, wasteType) => {
    setEnabledWasteTypes((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [wasteType]: !prev[category][wasteType],
      },
    }));
  };

  const handleDisposalChange = (wasteType, method) => {
    setDisposalMethods((prevMethods) => ({
      ...prevMethods,
      [wasteType]: method,
    }));
  };

  const calculateWasteValues = () => {
    const updatedCalculatedData = {
      biodegradable: {},
      combustible: {},
      recyclable: {},
      residual: {},
    };

    const calculateCategoryWaste = (category, categoryWasteList) => {
      categoryWasteList.forEach((wasteType) => {
        const totalWaste = combinedWasteData[wasteType] || 0;
        const percentage = enabledWasteTypes[category][wasteType]
          ? selectedWasteTypes[category][wasteType] || 0
          : 0;
        const calculatedValue = (totalWaste * percentage) / 100;

        updatedCalculatedData[category][wasteType] = calculatedValue;
      });
    };

    calculateCategoryWaste('biodegradable', biodegradableWaste);
    calculateCategoryWaste('combustible', combustibleWaste);
    calculateCategoryWaste('recyclable', recyclableWaste);

    // Calculate residual waste correctly
    Object.keys(combinedWasteData).forEach((wasteType) => {
      const totalWaste = combinedWasteData[wasteType] || 0;
      const totalCalculated =
        (updatedCalculatedData.biodegradable[wasteType] || 0) +
        (updatedCalculatedData.combustible[wasteType] || 0) +
        (updatedCalculatedData.recyclable[wasteType] || 0);
      updatedCalculatedData.residual[wasteType] = totalWaste - totalCalculated;
    });

    setCalculatedData(updatedCalculatedData);
  };

  const handleNext = () => {
    const totals = {
      biodegradableTotal: Object.values(calculatedData.biodegradable).reduce((sum, value) => sum + value, 0),
      combustibleTotal: Object.values(calculatedData.combustible).reduce((sum, value) => sum + value, 0),
      recyclableTotal: Object.values(calculatedData.recyclable).reduce((sum, value) => sum + value, 0),
      residualTotal: Object.values(calculatedData.residual).reduce((sum, value) => sum + value, 0),
    };

    navigate('/cf-calculations', {
      state: { calculatedData, totals },
    });
  };

  return (
    <div style={{ padding: '20px', maxHeight: '100vh', overflowY: 'auto' }}>
      <h1>Carbon Footprint Calculator</h1>
      <section>
      

<h2>Select Waste Categories</h2>
<table
  border="1"
  style={{
    width: '100%',
    marginBottom: '20px',
    borderCollapse: 'collapse',
  }}
>
  <thead>
    <tr>
      <th style={{ padding: '10px', backgroundColor: '#f2f2f2' }}>Biodegradables</th>
      <th style={{ padding: '10px', backgroundColor: '#f2f2f2' }}>Combustibles</th>
      <th style={{ padding: '10px', backgroundColor: '#f2f2f2' }}>Recyclables</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{ verticalAlign: 'top', padding: '10px' }}>
        {biodegradableWaste.map((wasteType) => (
          <div key={wasteType} style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={enabledWasteTypes.biodegradable[wasteType] || false}
                onChange={() => handleCheckboxChange('biodegradable', wasteType)}
                aria-label={`Select ${wasteType} waste`}
              />
              <i
                className="fas fa-leaf" // Icon representing biodegradables
                style={{ marginLeft: '5px', color: 'green' }}
                title={`Biodegradable waste: ${wasteType}`}
              ></i>
              {wasteType} ({combinedWasteData[wasteType] || 0} kg)
            </label>
            <input
              type="number"
              value={selectedWasteTypes.biodegradable[wasteType] || 0}
              onChange={(e) =>
                handlePercentageChange('biodegradable', wasteType, parseFloat(e.target.value))
              }
              min="0"
              max="100"
              step="10"
              disabled={!enabledWasteTypes.biodegradable[wasteType]}
              style={{
                marginLeft: '10px',
                width: '60px',
                borderColor: selectedWasteTypes.biodegradable[wasteType] < 0 || selectedWasteTypes.biodegradable[wasteType] > 100 ? 'red' : '',
              }}
              aria-label={`Enter percentage for ${wasteType}`}
              title={`Enter the percentage of ${wasteType} waste`} // Tooltip for input
            />
          </div>
        ))}
      </td>
      <td style={{ verticalAlign: 'top', padding: '10px' }}>
        {combustibleWaste.map((wasteType) => (
          <div key={wasteType} style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={enabledWasteTypes.combustible[wasteType] || false}
                onChange={() => handleCheckboxChange('combustible', wasteType)}
                aria-label={`Select ${wasteType} waste`}
              />
              <i
                className="fas fa-fire" // Icon representing combustibles
                style={{ marginLeft: '5px', color: 'orange' }}
                title={`Combustible waste: ${wasteType}`}
              ></i>
              {wasteType} ({combinedWasteData[wasteType] || 0} kg)
            </label>
            <input
              type="number"
              value={selectedWasteTypes.combustible[wasteType] || 0}
              onChange={(e) =>
                handlePercentageChange('combustible', wasteType, parseFloat(e.target.value))
              }
              min="0"
              max="100"
              step="10"
              disabled={!enabledWasteTypes.combustible[wasteType]}
              style={{
                marginLeft: '10px',
                width: '60px',
                borderColor: selectedWasteTypes.combustible[wasteType] < 0 || selectedWasteTypes.combustible[wasteType] > 100 ? 'red' : '',
              }}
              aria-label={`Enter percentage for ${wasteType}`}
              title={`Enter the percentage of ${wasteType} waste`} // Tooltip for input
            />
          </div>
        ))}
      </td>
      <td style={{ verticalAlign: 'top', padding: '10px' }}>
        {recyclableWaste.map((wasteType) => (
          <div key={wasteType} style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={enabledWasteTypes.recyclable[wasteType] || false}
                onChange={() => handleCheckboxChange('recyclable', wasteType)}
                aria-label={`Select ${wasteType} waste`}
              />
              <i
                className="fas fa-recycle" // Icon representing recyclables
                style={{ marginLeft: '5px', color: 'blue' }}
                title={`Recyclable waste: ${wasteType}`}
              ></i>
              {wasteType} ({combinedWasteData[wasteType] || 0} kg)
            </label>
            <input
              type="number"
              value={selectedWasteTypes.recyclable[wasteType] || 0}
              onChange={(e) =>
                handlePercentageChange('recyclable', wasteType, parseFloat(e.target.value))
              }
              min="0"
              max="100"
              step="10"
              disabled={!enabledWasteTypes.recyclable[wasteType]}
              style={{
                marginLeft: '10px',
                width: '60px',
                borderColor: selectedWasteTypes.recyclable[wasteType] < 0 || selectedWasteTypes.recyclable[wasteType] > 100 ? 'red' : '',
              }}
              aria-label={`Enter percentage for ${wasteType}`}
              title={`Enter the percentage of ${wasteType} waste`} // Tooltip for input
            />
          </div>
        ))}
      </td>
    </tr>
  </tbody>
</table>


        <button onClick={() => {
  calculateWasteValues();
  setShowModal(true);
}} style={{ marginBottom: '10px' }}>Show Calculated Waste Values</button>

<button onClick={() => setShowChart(!showChart)} style={{ marginLeft: '280px', marginBottom: '10px' }}>
  {showChart ? 'Hide Bar Chart' : 'Show Bar Chart'}
</button>

<button onClick={handleNext} style={{ marginLeft: '280px' }}>Next</button>

      </section>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <section>
        
      
        {/* Modal for Calculated Waste Values */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
              <table border="1" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th colSpan="2">Biodegradable</th>
                    <th colSpan="2">Combustible</th>
                    <th colSpan="2">Recyclable</th>
                    <th colSpan="2">Residues</th>
                  </tr>
                  <tr>
                    <th>Waste Type</th>
                    <th>Amount (Kg)</th>
                    <th>Waste Type</th>
                    <th>Amount (Kg)</th>
                    <th>Waste Type</th>
                    <th>Amount (Kg)</th>
                    <th>Waste Type</th>
                    <th>Amount (Kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(
                    Object.keys(calculatedData.biodegradable).length,
                    Object.keys(calculatedData.combustible).length,
                    Object.keys(calculatedData.recyclable).length,
                    Object.keys(calculatedData.residual).length
                  ) }).map((_, index) => (
                    <tr key={index}>
                      <td>{Object.keys(calculatedData.biodegradable)[index] || ""}</td>
                      <td>{calculatedData.biodegradable[Object.keys(calculatedData.biodegradable)[index]]?.toFixed(2) || ""}</td>
                      <td>{Object.keys(calculatedData.combustible)[index] || ""}</td>
                      <td>{calculatedData.combustible[Object.keys(calculatedData.combustible)[index]]?.toFixed(2) || ""}</td>
                      <td>{Object.keys(calculatedData.recyclable)[index] || ""}</td>
                      <td>{calculatedData.recyclable[Object.keys(calculatedData.recyclable)[index]]?.toFixed(2) || ""}</td>
                      <td>{Object.keys(calculatedData.residual)[index] || ""}</td>
                      <td>{calculatedData.residual[Object.keys(calculatedData.residual)[index]]?.toFixed(2) || ""}</td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{Object.values(calculatedData.biodegradable).reduce((sum, value) => sum + value, 0).toFixed(2)}</strong></td>
                    <td><strong>Total</strong></td>
                    <td><strong>{Object.values(calculatedData.combustible).reduce((sum, value) => sum + value, 0).toFixed(2)}</strong></td>
                    <td><strong>Total</strong></td>
                    <td><strong>{Object.values(calculatedData.recyclable).reduce((sum, value) => sum + value, 0).toFixed(2)}</strong></td>
                    <td><strong>Total</strong></td>
                    <td><strong>{Object.values(calculatedData.residual).reduce((sum, value) => sum + value, 0).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Button to Toggle Bar Chart */}      
      <section>

      </section>

      {/* Bar Chart in Modal (Floating Window) */}
      {showChart && (
        <div className="chart-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowChart(false)}>&times;</span>
            <h2>Waste Distribution</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      
    </div>
  );
};

export default CarbonFootprint;
