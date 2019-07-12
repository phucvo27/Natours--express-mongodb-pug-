const userRouter = require('express').Router();
const userControllers = require('../controllers/userController');
const authController = require('../controllers/authController');


userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.patch('/updatePassword', authController.protect ,authController.updatePassword);
userRouter.patch('/updateMe', authController.protect ,userControllers.updateUser);
userRouter.delete('/deleteMe', authController.protect ,userControllers.deleteUser);

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