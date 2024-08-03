import React, { useState, useEffect, useRef } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import io from 'socket.io-client';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const IndividualTeams = () => {
  const [ohlcData, setOhlcData] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(105); // Default to team 105
  const [teams, setTeams] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState(''); // Add state for team name
  const [userTrades, setUserTrades] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chartRef = useRef(null); // Create a ref to store the chart instance
  const socket = useRef(null); // Create a ref to store the socket instance

  useEffect(() => {
    // Check if a JWT token exists in local storage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    // Load ohlcData from local storage on component mount
    const storedOhlcData = localStorage.getItem(`ohlcData-${selectedTeamId}`);
    if (storedOhlcData) {
      setOhlcData(JSON.parse(storedOhlcData));
    } else {
      // If no data in local storage, fetch from the database
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
    }

    socket.current = io('http://localhost:3001'); // Connect to your server

    // Handle price updates
    socket.current.on('priceUpdate', (data) => {
      if (data.teamId === selectedTeamId) {
        // Update the last data point in ohlcData with the new price
        setOhlcData(prevData => {
          const updatedData = [...prevData];
          const lastDataPointIndex = updatedData.length - 1;
          const currentPrice = data.price;

          // Update high and low values based on the new price
          updatedData[lastDataPointIndex].high = Math.max(updatedData[lastDataPointIndex].high, currentPrice);
          updatedData[lastDataPointIndex].low = Math.min(updatedData[lastDataPointIndex].low, currentPrice);

          // Update only the close value
          updatedData[lastDataPointIndex].close = currentPrice;

          return updatedData;
        });
        // Re-render the chart after updating the data
        if (chartRef.current) {
          chartRef.current.render();
        }
      }
    });

    // Send team selection to the server
    socket.current.emit('selectTeam', selectedTeamId);

    // Clean up the connection on unmount
    return () => {
      socket.current.disconnect();
    };
  }, [selectedTeamId]);

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

  const handleTrade = (type) => {
    if (!isLoggedIn) {
      alert('Please log in to trade.');
      return;
    }

    const currentPrice = chartRef.current.options.data[0].dataPoints[ohlcData.length - 1].y[3];
    console.log("Current Price:", currentPrice); // Log the current price
    const newTrade = {
      teamId: selectedTeamId,
      type: type,
      quantity: 1,
      price: currentPrice,
      timestamp: new Date()
    };
    setUserTrades([...userTrades, newTrade]);

    // Send trade event to the server
    socket.current.emit('trade', {
      teamId: selectedTeamId,
      type: type,
      quantity: 1
    });
  };

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
      {isLoggedIn ? (
        <>
          <button onClick={() => handleTrade('buy')}>Buy</button>
          <button onClick={() => handleTrade('sell')}>Sell</button>
        </>
      ) : (
        <p>Please log in to trade.</p>
      )}
      <CanvasJSChart options={options}
        onRef={ref => chartRef.current = ref} // Assign the chart instance to the ref
      />
    </div>
  );
};

export default IndividualTeams;
