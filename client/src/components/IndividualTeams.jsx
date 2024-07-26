import React, { useState, useEffect, useRef } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const IndividualTeams = () => {
  const [ohlcData, setOhlcData] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(105); // Default to team 105
  const [teams, setTeams] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState(''); // Add state for team name
  const chartRef = useRef(null); // Create a ref to store the chart instance

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/teams'); // Fetch all teams
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchOhlcData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/teams/${selectedTeamId}/ohlc`); // Fetch OHLC data for selected team
        const data = await response.json();
        // Convert string values to numbers
        const formattedData = data.map(dataPoint => ({
          ...dataPoint,
          open: parseFloat(dataPoint.open),
          high: parseFloat(dataPoint.high),
          low: parseFloat(dataPoint.low),
          close: parseFloat(dataPoint.close)
        }));
        setOhlcData(formattedData);
      } catch (error) {
        console.error('Error fetching OHLC data:', error);
      }
    };

    fetchOhlcData();
  }, [selectedTeamId]); // Update when selectedTeamId changes

  // Update the chart options *after* the data is fetched
  useEffect(() => {
    if (chartRef.current && ohlcData.length > 0) {
      chartRef.current.options.data[0].dataPoints = ohlcData.map(dataPoint => ({
        x: new Date(dataPoint.date), // Use the date directly as the x-value
        y: [dataPoint.open, dataPoint.high, dataPoint.low, dataPoint.close]
      }));
      chartRef.current.render(); // Update the chart with the new data
    }
  }, [ohlcData]);

  // Find the team name based on the selectedTeamId
  useEffect(() => {
    const team = teams.find(team => team.id === selectedTeamId);
    if (team) {
      setSelectedTeamName(team.name);
    }
  }, [selectedTeamId, teams]);

  const options = {
    theme: "light2", // "light1", "light2", "dark1", "dark2"
    animationEnabled: true,
    exportEnabled: false,
    title: {
      text: `${selectedTeamName} OHLC Data` // Use the selectedTeamName here
    },
    axisX: {
      valueFormatString: "YYYY-MM-DD", // Use a format that matches the date format in your data
      labelAngle: -45 // Rotate labels for better readability
    },
    axisY: {
      prefix: "$",
      title: "Price (in USD)",
    },
    data: [{
      type: "candlestick",
      showInLegend: true,
      name: `Team ${selectedTeamName}`, // Update the name dynamically
      yValueFormatString: "$###0.00",
      // xValueFormatString: "MMMM YY", // Remove this line
      dataPoints: [] // Initialize dataPoints as an empty array
    }],
    width: 600,
    height: 300
  };

  return (
    <div>
      <h2>Team OHLC Data</h2>
      <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(parseInt(e.target.value, 10))}>
        {teams.map(team => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
      <CanvasJSChart options={options}
        onRef={ref => chartRef.current = ref} // Assign the chart instance to the ref
      />
    </div>
  );
};

export default IndividualTeams;
