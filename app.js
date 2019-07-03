// Set up express server
const express = require('express');
const path = require('path');

// get route
const { userRouter } = require('./routes/userRoutes');
const { tourRouter } = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalError = require('./controller/errorController');
const app = express();

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.use(express.json())

app.use((req, res, next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/user', userRouter);
app.use('/tour', tourRouter);

// Error handling route

app.all('*', (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl}`, 404))
})

app.use(globalError)

module.exports = {
    app
};