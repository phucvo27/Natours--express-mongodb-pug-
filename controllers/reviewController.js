const catchAsync = require('../utils/catchAsync');
const Review = require('../models/Review');
const helper = require('../utils/helpers');

exports.getAllReviews = catchAsync(async (req, res, next)=>{
    const reviews = await Review.find();
    
    res.status(200).json({
        status: 'Success',
        data: {
            reviews
        }
    })
})


exports.createReview = catchAsync(async (req, res, next)=>{
    const objBody = helper.filterBody(req.body, 'review', 'rate', 'tour', 'user');
    const review = await Review.create(objBody);

    res.status(200).json({
        status: 'Success',
        review
    })
})