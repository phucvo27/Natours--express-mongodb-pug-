const dotenv = require('dotenv');
const mongoose = require('mongoose');


process.on('uncaughtException', (err)=>{
    console.log('Uncaught Exception , shutting down server');
    console.log(err.name, err.message);
    // must close server first 
    process.exit(1);
})

dotenv.config({path : './config.env'});
const { app } = require('./app');


const { PORT } = process.env;
const DB = process.env.DATABASE;

mongoose.connect(DB, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false})
    .then(con => {
        console.log(`Connection success`);
    })
    .catch(err => {
        console.log('Could not connect')
    })

const server = app.listen(PORT, 'localhost', ()=>{
    console.log(`Server is starting at : ${PORT}`)
})

process.on('unhandledRejection', (err)=>{
    console.log(err.name, err.message);
    console.log('Unhandle rejection , shutting down server');
    
    // must close server first 
    server.close(()=>{
        process.exit(1);
    })
});
