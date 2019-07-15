const catchAsync = require('../utils/catchAsync');
const Review = require('../models/Review');
const helper = require('../utils/helpers');

exports.getAllReviews = catchAsync(async (req, res, next)=>{
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId}
    const reviews = await Review.find(filter);
    
    res.status(200).json({
        status: 'Success',
        data: {
            reviews
        }
    })
})


exports.createReview = catchAsync(async (req, res, next)=>{
    const objBody = helper.filterBody(req.body, 'review', 'rate');
    objBody.user = req.user;
    objBody.tour = req.params.tourId
    const review = await Review.create(objBody);

    res.status(200).json({
        status: 'Success',
        review
    })
})