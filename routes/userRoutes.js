const userRouter = require('express').Router();
const userControllers = require('../controllers/userController');
const authController = require('../controllers/authController');


userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);


userRouter.use(authController.protect);

userRouter.patch('/updatePassword', authController.updatePassword);
userRouter.get('/me', userControllers.getMe, userControllers.getUser);
userRouter.patch('/updateMe',userControllers.updateMe);
userRouter.delete('/deleteMe',userControllers.deleteMe);

userRouter.use(authController.restrictTo('admin'))
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