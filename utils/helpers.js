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

    res.status(statusCode).json({
        status: 'success',
        token
    })
}