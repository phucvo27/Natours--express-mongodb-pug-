const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const verifyToken = promisify(jwt.verify);

const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES})
}

exports.signup = catchAsync(async (req, res, next)=>{
    const newUser = await User.create(req.body);
    const token = generateToken(newUser._id);
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async ( req, res, next)=>{
    const { email , password } = req.body;
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }

    // check email and password exist
    const user = await User.findOne({email}).select("+password");
    
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 400));
    }
    const token = generateToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })  
})

exports.protect = catchAsync(async (req, res, next)=>{

    let token;
    // Getting token and check of it's there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('You are not logged in ! Please log in to get access', 401))
    }
    // Verify token
    //const decoded = await promisify(jwt.verify())(token, process.env.JWT_SECRET); // make it to async function , and now we can catch with catchSync
    const decoded = await verifyToken(token, process.env.JWT_SECRET); // make it to async function , and now we can catch with catchSync
    
    // Check if user still exists

    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belong to this token does no exist', 401))
    }

    // Check if user changed password after the token was issued 
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password. Please log in again', 401))
    } // iat <=> issue at

    // Grant access to protected route 
    req.user = currentUser;
    next();
})