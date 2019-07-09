const { User } = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterBody } = require('../utils/helpers');

exports.getAllUser = catchAsync(async (req, res, next)=>{
    const users = await User.find({active: {$ne: false}});

    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
})
exports.getUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}

exports.createUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}

exports.updateUser = catchAsync(async (req, res, next)=>{

    // 1. Only using for update profile
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route only for update profile, no update password \n. Please use updatePassword route for update password', 400))
    }
    const filterObject = filterBody(req.body, 'name', 'email')
    const user = await User.findByIdAndUpdate(req.user._id, filterObject, {new: true , runValidators: true});
    
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteUser = catchAsync(async (req, res, next)=>{
    await User.findByIdAndUpdate(req.user._id, {active: false});
    
    res.status(200).json({
        status: 'success',
        data: null
    })
})