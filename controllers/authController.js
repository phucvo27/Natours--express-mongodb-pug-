const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const { sendResponseToken } = require('../utils/helpers'); 

const verifyToken = promisify(jwt.verify);


exports.signup = catchAsync(async (req, res, next)=>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    sendResponseToken(newUser, 200, res);
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
    sendResponseToken(user, 200, res);
      
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
    // 1. Get the user based on toke
    const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Check token does it expired
    const user = await User.findOne({passwordResetToken, passwordResetExpires: {$gt: Date.now()}});
    if(!user){
        return next(new AppError('Your token is expired. Please try again', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    sendResponseToken(user, 200, res);

});

exports.updatePassword = catchAsync(async (req, res, next)=>{

    // 1. Get user from db
    const user = await User.findById(req.user._id).select("+password");

    // 2. check posted password 
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 400))
    }

    // 3. Update password
    user.password = req.body.password,
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    sendResponseToken(user, 200, res);

})