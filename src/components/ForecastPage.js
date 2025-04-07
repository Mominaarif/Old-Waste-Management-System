import React from 'react';
import { useLocation } from 'react-router-dom';
import './ForecastPage.css'; 
const ForecastPage = () => {
  const location = useLocation();
  const { forecastedValues, presentPopulation, forecastYear } = location.state || {};
  console.log("forecasted", forecastedValues);

  if (!forecastedValues) {
    return <div className="no-data">No forecast data available.</div>;
  }

  // Get all unique subtypes for alignment across categories
  const allSubtypes = Array.from(
    new Set(Object.values(forecastedValues).flatMap(Object.keys))
  );

  return (
    <div className="forecast-container">
      <h1>Waste Forecasting Results</h1>
      <div className="info">
        <h2>Current Population: <span>{presentPopulation}</span></h2>
        <h2>Forecast Year: <span>{forecastYear}</span></h2>
      </div>

      <table className="forecast-table">
        <thead>
          <tr>
            <th>Subtype</th>
            {Object.keys(forecastedValues).map((category) => (
              <th key={category}>{category.charAt(0).toUpperCase() + category.slice(1)} (kg)</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSubtypes.map((subtype) => (
            <tr key={subtype}>
              <td>{subtype.charAt(0).toUpperCase() + subtype.slice(1)}</td>
              {Object.keys(forecastedValues).map((category) => (
                <td key={`${category}-${subtype}`}>
                  {forecastedValues[category][subtype] || 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ForecastPage;
