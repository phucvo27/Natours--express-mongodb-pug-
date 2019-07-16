const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ApiFeature } = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'delete success'
    })
})


exports.updateOne = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!doc){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

exports.createOne = Model => catchAsync(async (req, res,next)=>{
    const doc = await Model.create(req.body)
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
})

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res,next)=>{
    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if(!doc){
        // handle when pass wrong ObjectId -> return null
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res, next)=>{
    // Allow nested GET reviews on Tour
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};

    const features = new ApiFeature(Model.find(filter), req.query)
        .filter()
        .fieldLimit()
        .sort()
        .pagination()
    // Execute Query
    const doc = await features.query;
    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    })  
});