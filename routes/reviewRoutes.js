const reviewRouter = require('express').Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user') ,reviewController.setTourAndUserIds ,reviewController.createReview);

reviewRouter
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.protect, authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.protect, authController.restrictTo('user', 'admin'), reviewController.deleteReview)

module.exports = { reviewRouter };