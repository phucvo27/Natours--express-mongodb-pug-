const { Tour } = require('../models/Tour');
const { ApiFeature } = require('../utils/apiFeatures');


exports.aliasTopTours = (req, res, next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields= 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTour = async (req, res)=>{
    try{
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
    }catch(e){
        console.log(e)
        res.status(500).json({
            status: 'fail'
        })
    }
    
}
exports.getTour = async (req, res)=>{
    try{
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }catch(e){
        res.status(500).json({
            status: 'fail',
            message: e
        })
    }
}

exports.createTour = async (req, res)=>{
    try{
        const tour = await Tour.create(req.body)
        
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }catch(e){
        res.status(500).json({
            status: 'fail',
            message: 'invalid input'
        })
    }
    
}

exports.updateTour = async (req, res)=>{
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }catch(e){
        res.status(500).json({
            status: 'fail',
            message: 'Invalid input'
        })
    }
}

exports.deleteTour = async (req, res)=>{
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'delete success'
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            status: 'fail',
            message: 'Invalid input'
        })
    }
}

exports.getTourStats = async (req, res)=>{
    console.log('running stats')
    try{
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
    }catch(e){
        console.log(e);
        res.status(400).json({
            status: 'fails',
            message: e
        })
    }
}

exports.getMonthlyPlan = async ( req, res)=>{
    try{
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

    }catch(e){
        res.status(400).json({
            status: 'fail',
            message: e
        })
    }
}