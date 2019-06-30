const userRouter = require('express').Router();
const userControllers = require('../controller/userController');

//userRouter.param('id', userControllers.checkId);

userRouter
    .route('/')
    .get(userControllers.getAllUser)
    .post(userControllers.createUser)

userRouter
    .route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser);

module.exports = {
    userRouter
};