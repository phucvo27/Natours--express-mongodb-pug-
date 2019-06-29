const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { app } = require('./app');

dotenv.config({path : './config.env'});

const { PORT } = process.env;
const DB = process.env.DATABASE;

mongoose.connect(DB, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false})
    .then(con => {
        console.log(`Connection success :  ${con}`);
    })
    .catch(err => {
        console.log('Could not connect')
    })

app.listen(PORT, 'localhost', ()=>{
    console.log(`Server is starting at : ${PORT}`)
})