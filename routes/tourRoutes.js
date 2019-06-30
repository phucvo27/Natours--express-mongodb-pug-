const tourRouter = require('express').Router();
const tourControllers = require('../controller/tourController');


tourRouter
    .route('/')
    .get(tourControllers.getAllTour)
    .post(tourControllers.createTour);

tourRouter
    .route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.updateTour)
    .delete(tourControllers.deleteTour);

module.exports = { tourRouter };