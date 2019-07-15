const tourRouter = require('express').Router();
const tourControllers = require('../controllers/tourController');
const authController = require('../controllers/authController');
const { reviewRouter } = require('../routes/reviewRoutes');


tourRouter.use('/:tourId/review', reviewRouter);

tourRouter
    .route('/top-5-cheap')
    .get(tourControllers.aliasTopTours, tourControllers.getAllTour);

tourRouter.route('/tour-stats').get(tourControllers.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

tourRouter
    .route('/')
    .get(authController.protect,tourControllers.getAllTour)
    .post(tourControllers.createTour);

tourRouter
    .route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.updateTour)
    .delete( authController.protect, authController.restrictTo('lead-guid', 'admin') ,tourControllers.deleteTour);

module.exports = { tourRouter };