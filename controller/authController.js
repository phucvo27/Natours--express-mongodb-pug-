const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

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


exports.restrictTo = (...roles)=>{
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action’', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next)=>{
    const { email } = req.body;
    // 1. Get user based on email

    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('There is no user with that email address', 404));
    }
    // 2. Generate token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false}); // save the resetPassword and passwordResetExpires into database; -> but dont run validation
    
    // 3. Send to email
    const resetUrl = `${req.protocol}://${req.get('host')}/user/resetPassword/${resetToken}`;
    const message = `Forgot your password . Submit the PATCH request with your new password and passwordConfirm to : ${resetUrl}.\n If you dont forgot your password, please ignore this email`;

    try {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message
        });
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
});

exports.resetPassword = catchAsync(async (req, res, next)=>{

});