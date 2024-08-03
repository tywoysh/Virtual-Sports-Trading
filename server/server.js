const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const http = require('http').createServer(app); // Create HTTP server
const io = require('socket.io')(http, { // Initialize Socket.IO
  cors: {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: ['GET', 'POST'],
  },
});
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.use('/api/teams', require('./routes/API/teams'));
app.use('/api/auth', require('./routes/API/auth'));


// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');



  // Handle trade events
  socket.on('trade', async (tradeData) => {
    const { teamId, type, quantity } = tradeData;

    // 1. Fetch the team and its latest OHLC data
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        Ohlc: {
          orderBy: { date: 'desc' },
          take: 1, // Get the latest OHLC record for the team
        },
      },
    });

    if (team) {
      const latestPrice = parseFloat(team.Ohlc[0].close);

      // 2. Simulate price change based on trade
      let updatedPrice = latestPrice;
      const priceChange = 0.5; // Random change between -2 and 2
      if (type === 'buy') {
        updatedPrice += priceChange * quantity; // Increase price for buy
      } else if (type === 'sell') {
        updatedPrice -= priceChange * quantity; // Decrease price for sell
      }

      // 3. Update the latest OHLC record in the database
      await prisma.ohlc.update({
        where: {
          id: team.Ohlc[0].id, // Update the latest record
        },
        data: {
          // Open price stays the same
          open: team.Ohlc[0].open, 
          // Update high if the new price is higher
          high: Math.max(team.Ohlc[0].high, updatedPrice), 
          // Update low if the new price is lower
          low: Math.min(team.Ohlc[0].low, updatedPrice), 
          // Update close price
          close: updatedPrice,
        },
      });

      // 4. Broadcast the updated price to all connected clients
      io.emit('priceUpdate', { teamId: teamId, price: updatedPrice });
    }

        // Bot logic
        const botUsers = [
          { id: 2, username: 'Bot1', teamId: 201 }, // Example: Bot1 trades on team 105
          { id: 3, username: 'Bot2', teamId: 202 }, // Example: Bot2 trades on team 106
        ];
      
        botUsers.forEach(bot => {
          setInterval(async () => {
            const tradeType = Math.random() < 0.5 ? 'buy' : 'sell'; // Randomly choose buy or sell
            const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1 and 3
      
            // Simulate trade
            socket.emit('trade', {
              teamId: bot.teamId,
              type: tradeType,
              quantity: quantity,
              userId: bot.id, // Include bot's user ID
            });
          }, 5000); // Trade every 5 seconds
        });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
  
// Start the server
http.listen(3001, () => {
  console.log('Server is running on port 3001');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

module.exports = app;