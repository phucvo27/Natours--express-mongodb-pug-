const userRouter = require('express').Router();


userRouter
    .route('/')
    .get()
    .post()

userRouter
    .route('/:id')
    .get()
    .patch()
    .delete();

module.exports = {
    userRouter
};