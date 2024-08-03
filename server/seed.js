const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedTeams() {
  // Delete existing data
  await prisma.ohlc.deleteMany(); // Delete all OHLC records
  await prisma.team.deleteMany(); // Delete all Team records

  const teams = [
    { name: "New York Rangers", openingPrice: 86.0 },
    { name: "Dallas Stars", openingPrice: 91.0 },
    { name: "Carolina Hurricanes", openingPrice: 85.0 },
    { name: "Winnipeg Jets", openingPrice: 70.0 },
    { name: "Florida Panthers", openingPrice: 93.0 },
    { name: "Boston Bruins", openingPrice: 73.0 },
    { name: "Vancouver Canucks", openingPrice: 72.0 },
    { name: "Colorado Avalanche", openingPrice: 84.0 },
    { name: "Edmonton Oilers", openingPrice: 95.0 },
    { name: "Toronto Maple Leafs", openingPrice: 75.0 },
    { name: "Nashville Predators", openingPrice: 70.0 },
    { name: "Los Angeles Kings", openingPrice: 65.0 },
    { name: "Tampa Bay Lightning", openingPrice: 69.0 },
    { name: "Vegas Golden Knights", openingPrice: 72.0 },
    { name: "New York Islanders", openingPrice: 57.0 },
    { name: "St. Louis Blues", openingPrice: 55.0 },
    { name: "Washington Capitals", openingPrice: 51.0 },
    { name: "Detroit Red Wings", openingPrice: 58.0 },
    { name: "Pittsburgh Penguins", openingPrice: 53.0 },
    { name: "Minnesota Wild", openingPrice: 53.0 },
    { name: "Philadelphia Flyers", openingPrice: 52.0 },
    { name: "Buffalo Sabres", openingPrice: 51.0 },
    { name: "New Jersey Devils", openingPrice: 73.0 },
    { name: "Seattle Kraken", openingPrice: 49.0 },
    { name: "Calgary Flames", openingPrice: 48.0 },
    { name: "Ottawa Senators", openingPrice: 53.0 },
    { name: "Arizona Coyotes", openingPrice: 47.0 },
    { name: "Montreal Canadiens", openingPrice: 44.0 },
    { name: "Columbus Blue Jackets", openingPrice: 38.0 },
    { name: "Anaheim Ducks", openingPrice: 34.0 },
    { name: "Chicago Blackhawks", openingPrice: 31.0 },
    { name: "San Jose Sharks", openingPrice: 27.0 },
  ];

  for (const teamData of teams) {
    const team = await prisma.team.create({
      data: teamData,
    });

    // Generate a month's worth of OHLC data
    const ohlcData = generateRandomOHLCData(team.openingPrice, 30); // 30 days

    // Insert OHLC data into the database
    for (const ohlc of ohlcData) {
      await prisma.ohlc.create({
        data: {
          teamId: team.id,
          date: ohlc.date,
          open: ohlc.open,
          high: ohlc.high,
          low: ohlc.low,
          close: ohlc.close,
        },
      });
    }
  }

  console.log("Teams and OHLC data seeded successfully!");
  await prisma.$disconnect();
}

function generateRandomOHLCData(openingPrice, days) {
  const ohlcData = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days+1); // Start a month ago

  let previousClose = parseFloat(openingPrice); // Initialize with opening price

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate random OHLC values (adjust as needed)
    const open = previousClose; // Open is the previous day's close
    const high = open + (Math.random() * 5);
    const low = open - (Math.random() * 5);
    const close = open + (Math.random() - 0.5) * 5;

    // Correct date formatting
    ohlcData.push({
      date: date.toISOString(), // Use full ISO-8601 format
      open,
      high,
      low,
      close: parseFloat(close).toFixed(2),
    });

    previousClose = close; // Update previousClose for the next day
  }

  return ohlcData;
}

seedTeams();
