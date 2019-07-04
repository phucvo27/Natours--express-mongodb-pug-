const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchemas = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide the email'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function(val){
                return validator.isEmail(val);
            },
            message: 'Please provide a valid email'
        }
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(val){
                return val === this.password
            },
            message: 'Make sure the confirm is same as your password'
        }
    },
    passwordChangedAt: Date

});


userSchemas.pre('save', async function(next){
    const user = this;
    // if password is not modified -> dont need to be hash 
    if(!user.isModified('password')){
        next();
    }
    // only run if password is modified
    user.password = await bcrypt.hash(user.password, 12);
    user.passwordConfirm = undefined; 
});

userSchemas.methods.changedPasswordAfter = function(JWTTimestamp){
    // if user does not change password before -> it will be undefined
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimeStamp; // JWT < changed <=> password is changed after the token was issued
    }
    return false;
}

userSchemas.methods.correctPassword = async function(passwordFromClient, userPassword){
    return await bcrypt.compare(passwordFromClient, userPassword); // return true if password is same
}


const User = mongoose.model('User', userSchemas);

module.exports = { User };
