const jwt = require('jsonwebtoken');

exports.filterBody = (body , ...allowedFields)=>{
    const result = {};
    allowedFields.forEach(el => body[el] && (result[el] = body[el]));
    return result;
}

const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES})
}
exports.sendResponseToken = (user , statusCode, res )=>{
    const token = generateToken(user._id);
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 24*60*60*1000)
    }
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    // remove the password from output -> when creating document , the pasword field is returned from query ( select false only work with query )
    user.password = undefined;
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}