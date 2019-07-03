class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // if false that error is a Programming Error

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError