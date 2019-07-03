const mongoose = require('mongoose');
//const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        minlength: [10, 'A name must have at least 10 character'],
        maxlength: [40, 'A name must be less than or equal 40 character'],
        //validate: [validator.isAlpha, 'Tour name must only contain the character']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A rating must be above 1.0'],
        max: [5, 'A rating must be equal or less than 5.0']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficult is either: easy, medium, difficult'
        }
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){
                return val < this.price
            },
            message: 'The price discount must be less than the price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true , 'A tour must have a cover image']
    },
    images: [
        String
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date]
});

// tourSchema.pre(/^find/, function(next){

// })


const Tour = mongoose.model('Tour', tourSchema);

module.exports = { Tour };