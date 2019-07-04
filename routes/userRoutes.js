const userRouter = require('express').Router();
const userControllers = require('../controller/userController');
const authController = require('../controller/authController');


userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

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