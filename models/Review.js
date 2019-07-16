const mongoose = require('mongoose');
const { Tour } = require('./Tour');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'The review could not be empty']
    },
    rating: {
        type : Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'The review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The review must belong to a user']
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.statics.calAverageRatings = async function(tourId){

    const stats = await this.aggregate([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: "$tour",
                nRatings: {$sum: 1},
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate({_id: tourId} , {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRatings
        })
    }else{
        // because 4.5 is default value
        await Tour.findByIdAndUpdate({_id: tourId} , {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}

reviewSchema.post('save', function(){
    // update avgRating when completely save review
    this.constructor.calAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, function(next){
    console.log('Preparing for update');
    next();
})
reviewSchema.post(/^findOneAnd/, async function(reviewUpdated){
    // when update or delete review -> must update avgRating of certain Tour
    console.log('======== Updated============ \n')
    await reviewUpdated.constructor.calAverageRatings(reviewUpdated.tour)
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;