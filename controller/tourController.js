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

/*

// const queryObj = {...req.query};
        // const exclusiveFields = ['page','sort','limit','fields'];
        // exclusiveFields.forEach(el => delete queryObj[el]);
        
        // // Advance filter
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        // // Build query
        // const query = Tour.find(JSON.parse(queryStr));
        // console.log(query)

        // sorting 
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // }else{
        //     query = query.sort("-createdAt"); // Descending 
        // }

        // // Fields Limiting
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select("-__v");
        // }

        // // Pagination 
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // if(req.query.page){
        //     const numTour = await Tour.countDocuments();
        //     if(skip >= numTour) throw new Error();
        // }
        //query = query.skip(skip).limit(limit);
*/