//const User = require('../models/User');

exports.getAllUser = (req, res)=>{
    res.status(200).json({
        status: 'success'
    })
}
exports.getUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}

exports.createUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}

exports.updateUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}

exports.deleteUser = (req, res)=>{
    res.status(500).json({
        status: 'fail',
        message: 'This route is not defined'
    })
}