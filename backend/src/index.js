const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/trips.routes');
require('dotenv').config();
const { createTripTable } = require('./model/trip.model');

const app = express();
app.use(cors());
app.use(express.json());

// Init DB table
createTripTable().then(()=>console.log('Trips table ready'));

app.use('/trips', tripRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));

