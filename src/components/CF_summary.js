import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
//import './SummaryScreen.css';

const SummaryScreen = ({ emissionData }) => {
  // Sample data structure for emissionData (replace with actual data):
   emissionData = [
     { technology: 'Anaerobic Digestion', ghg: 32.2 },
     { technology: 'RDF Production', ghg: 15.4 },
     { technology: 'Chemical Recycling', ghg: 17.9 },
     { technology: 'Landfilling with LGR', ghg: 16 },
   ];

  // Extracting data for chart
  const labels = emissionData.map(item => item.technology);
  const ghgValues = emissionData.map(item => item.ghg);

  // Bar chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: 'GHG Emissions (kg CO₂ eq.)',
        data: ghgValues,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate total GHG emissions
  const totalGHG = ghgValues.reduce((sum, value) => sum + value, 0);

  return (
    //<div className="summary-screen">
          <div className="summary-screen" style={{ padding: '20px', maxHeight: '100vh', overflowY: 'auto' }}>

      <h2>Summary of Footprints & Proposed Waste Management Scenario</h2>
      <p>Simulator proposes a scenario with the least carbon footprint for each waste category, shown in the flow below:</p>
      
      <div className="flow-diagram">
        {labels.map((label, index) => (
          <div key={index} className="flow-item">
            <p>% of total waste for {label}</p>
            <p>GHGs: {ghgValues[index]} kg CO₂ eq.</p>
          </div>
        ))}
      </div>

      <table className="ghg-emissions-table">
        <thead>
          <tr>
            <th>Proposed Technologies</th>
            <th>Net GHG Emissions (kg CO₂ eq.)</th>
          </tr>
        </thead>
        <tbody>
          {emissionData.map((item, index) => (
            <tr key={index}>
              <td>{item.technology}</td>
              <td>{item.ghg}</td>
            </tr>
          ))}
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{totalGHG}</strong></td>
          </tr>
        </tbody>
      </table>


    </div>
  );
};

export default SummaryScreen;
