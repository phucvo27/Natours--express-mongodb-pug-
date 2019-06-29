// Set up express server
const express = require('express');
const path = require('path');

// get route
const { userRouter } = require('./routes/userRoutes');
const { tourRouter } = require('./routes/tourRoutes');
const app = express();

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.use('/user', userRouter);
app.use('/tours', tourRouter);

module.exports = {
    app
};