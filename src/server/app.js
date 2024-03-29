const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const multer = require("multer");

const config = require('./config.js');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb )=> {
        cb(null,'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() +"-"+ file.originalname.replace(/ /g,''));
    }
})

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) =>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message || "Server Error";
    res.status(status).json({message:message});
})

mongoose.connect(config.MONGODB_URI, {useNewUrlParser: true}).then(result =>{
    console.log( `🚀   MongoDB/Mongoose connected to: ${config.MONGODB_URI}`);
    app.listen(8080);
}).catch(err => {
    console.log( `🛑   ERROR connecting to: ${config.MONGODB_URI}. ${err}`);
});