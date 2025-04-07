import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './map.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Map = () => {
  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [forecastDuration, setForecastDuration] = useState(5);
  const [wasteData, setWasteData] = useState({
    labels: ['Residential Waste', 'Commercial Waste', 'Industrial Waste', 'Hazardous Waste'],
    datasets: [
      {
        label: 'Waste by Type (Tons)',
        data: [0, 0, 0, 0], // Initially set to zero
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  });

  const countries = ['Pakistan', 'India', 'USA', 'Germany', 'Canada'];
  const provinces = {
    Pakistan: ['Punjab', 'KPK', 'Balochistan', 'Sindh'],
  };

  const cities = {
    Punjab: ['Lahore', 'Rawalpindi', 'Multan', 'Faisalabad'],
    KPK: ['Peshawar', 'Mardan', 'Abbottabad', 'Swat'],
    Balochistan: ['Quetta', 'Gwadar', 'Khuzdar', 'Zhob'],
    Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana']
  };

  // Simulate fetching waste data and carbon emission factors dynamically
  const generateRandomWasteData = () => {
    return wasteData.labels.map(() => Math.floor(Math.random() * 200) + 50); // Random waste tonnage
  };

  const carbonEmissionFactors = {
    'Residential Waste': 100,   // kg CO2 per ton
    'Commercial Waste': 150,
    'Industrial Waste': 200,
    'Hazardous Waste': 300,
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedProvince('');
    setSelectedCity('');
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedCity('');
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    const newWasteData = generateRandomWasteData();
    setWasteData({
      ...wasteData,
      datasets: [
        {
          ...wasteData.datasets[0],
          data: newWasteData,
        },
      ],
    });
  };

  const handleForecastDurationChange = (e) => setForecastDuration(e.target.value);

  // Calculate total carbon emissions based on waste tonnage and emission factors
  const calculateCarbonFootprint = () => {
    return wasteData.labels.map((label, index) => {
      const wasteAmount = wasteData.datasets[0].data[index];
      const emissionFactor = carbonEmissionFactors[label];
      return wasteAmount * emissionFactor;
    });
  };

  const carbonFootprint = calculateCarbonFootprint();
  const totalCarbonEmissions = carbonFootprint.reduce((acc, value) => acc + value, 0);

  // Carbon footprint chart data (Pie chart)
  const pieData = {
    labels: wasteData.labels,
    datasets: [
      {
        label: 'Carbon Footprint (kg CO2)',
        data: carbonFootprint,
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  // Generate a forecast for each type of waste (simulated here)
  const generateWasteForecast = (initialAmount, growthRate) => {
    const forecast = [];
    let currentAmount = initialAmount;
    for (let year = 0; year < forecastDuration; year++) {
      forecast.push(currentAmount);
      currentAmount += currentAmount * growthRate; // Apply the growth rate
    }
    return forecast;
  };

  // Forecast data for each waste type
  const forecastData = {
    Residential: generateWasteForecast(wasteData.datasets[0].data[0], 0.1),  // 5% growth
    Commercial: generateWasteForecast(wasteData.datasets[0].data[1], 0.4),   // 4% growth
    Industrial: generateWasteForecast(wasteData.datasets[0].data[2], 0.3),   // 3% growth
    Hazardous: generateWasteForecast(wasteData.datasets[0].data[3], 0.2),    // 2% growth
  };

  // Update line chart labels dynamically based on forecast duration
  const forecastYears = Array.from({ length: forecastDuration }, (_, i) => `Year ${2024 + i}`);

  // Line chart data with separate datasets for each waste type
  const lineData = {
    labels: forecastYears, // Dynamic labels based on forecastDuration
    datasets: [
      {
        label: 'Residential Waste',
        data: forecastData.Residential,
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Commercial Waste',
        data: forecastData.Commercial,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Industrial Waste',
        data: forecastData.Industrial,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Hazardous Waste',
        data: forecastData.Hazardous,
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Waste Management Dashboard</h1>
      </header>

      <section className="filters">
        <label>
          Country:
          <select value={selectedCountry} onChange={handleCountryChange}>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        {selectedCountry && (
          <label>
            Province:
            <select value={selectedProvince} onChange={handleProvinceChange}>
              <option value="">Select Province</option>
              {provinces[selectedCountry]?.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </label>
        )}

        {selectedProvince && (
          <label>
            City:
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">Select City</option>
              {cities[selectedProvince]?.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Forecast Duration (Years):
          <input
            type="number"
            value={forecastDuration}
            onChange={handleForecastDurationChange}
            min="1"
            max="20"
          />
        </label>
      </section>

      <section className="charts">
        <div className="chart">
          <h2>Waste Categorization</h2>
          <Bar data={wasteData} />
        </div>

        <div className="chart">
          <h2>Waste Forecast by Type</h2>
          <Line data={lineData} />
        </div>

        <div className="pie-chart-container">
          <div className="pie-chart">
            <h2>Carbon Footprint</h2>
            <p>Total Carbon Emissions: {totalCarbonEmissions.toFixed(2)} kg CO2</p>
            <Pie data={pieData} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Map;
