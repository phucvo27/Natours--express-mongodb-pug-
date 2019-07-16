const Review = require('../models/Review');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review)

exports.setTourAndUserIds = (req, res, next)=>{
    // const objBody = helper.filterBody(req.body, 'review', 'rate');
    // objBody.user = req.user;
    // objBody.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user._id;
    if(!req.body.tour) req.body.tour = req.params.tourId;
    next();
}

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);