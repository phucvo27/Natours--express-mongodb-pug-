const AppError = require('../utils/appError');

const handleCastErrorDB = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = (err)=>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value : ${value} . Please use another value`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err)=>{
    let message = 'Invalid input data : ';
    const {errors} = err;
    for(let keys in errors){
        message += `${errors[keys].message}. `;
    }
    return new AppError(message, 400);
}

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    })
}

const sendErrorProd = (err, res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }else{
        // if error come from Programming , or something else , do not leak to client

        // 1) Log error
        console.error(`Error: ${err}`);
        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

const errorHanlder = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        if(error.name === 'CastError'){
            error = handleCastErrorDB(error)
        }
        if(error.code === 11000){
            error = handleDuplicateErrorDB(error);
        }
        if(error.name === 'ValidationError'){
            error = handleValidationErrorDB(error);
        }
        sendErrorProd(error, res);
    }
    
}

module.exports = errorHanlder;
