const { Tour } = require('../models/Tour');
const { ApiFeature } = require('../utils/apiFeatures');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields= 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTour = CatchAsync(async (req, res, next)=>{
    const features = new ApiFeature(Tour.find(), req.query)
        .filter()
        .fieldLimit()
        .sort()
        .pagination()
    // Execute Query
    const tours = await features.query;
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })  
});
exports.getTour = CatchAsync(async (req, res,next)=>{
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if(!tour){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.createTour = CatchAsync(async (req, res,next)=>{
    const tour = await Tour.create(req.body)
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
})

exports.updateTour = CatchAsync(async (req, res, next)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!tour){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = CatchAsync(async (req, res, next)=>{
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'delete success'
    })
})

exports.getTourStats = CatchAsync(async (req, res, next)=>{
    const stats = await Tour.aggregate([
        {
            $match:{
                ratingsAverage: { $gte: 4.5 }
            }
        },
        {
            $group:{
                _id: {$toUpper: "$difficulty"},
                numTours: {$sum : 1},
                numRatings: {$sum: "$ratingsQuantity"},
                avgRating: {$avg: "$ratingsAverage"},
                avgPrice: {$avg: "$pirce"},
                minPrice: {$min: "$price"},
                maxPrice: {$max: "$price"}
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'Success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = CatchAsync(async ( req, res, next)=>{
    const year = req.params.year * 1; // convert string to number
    const data = await Tour.aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match: { startDates: {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}}
        },
        {
            $group: {
                _id: {$month: "$startDates"},
                numTourStarts: {$sum: 1},
                tours: {$push: "$name"}
            }
        },
        {
            $addFields: {
                month: "$_id"
            }
        },
        {
            $project: {_id: 0}
        },
        {
            $sort: {numTourStarts: -1}
        }

    ])
    res.status(200).json({
        status: 'success',
        data: {
            data
        }
    })
})