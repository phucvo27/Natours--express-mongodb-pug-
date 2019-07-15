// Set up express server
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// get route
const { userRouter } = require('./routes/userRoutes');
const { tourRouter } = require('./routes/tourRoutes');
const { reviewRouter } = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalError = require('./controllers/errorController');
const app = express();

const publicDir = path.join(__dirname, 'public');

// Set security for HTTP Header

app.use(helmet());

// only accept 100 request from same ip on 1 hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'Too many request from this Ip , please try again in an hour' 
});


app.use(limiter);
app.use(express.static(publicDir));
app.use(express.json());

// Prevent NoSQL Injection
app.use(mongoSanitize())

// Prevent XSS attack
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

app.use((req, res, next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/user', userRouter);
app.use('/tours', tourRouter);
app.use('/review', reviewRouter)

// Error handling route

app.all('*', (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl}`, 404))
})

app.use(globalError)

module.exports = {
    app
};