const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/teams', require('./routes/API/teams'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

module.exports = app;