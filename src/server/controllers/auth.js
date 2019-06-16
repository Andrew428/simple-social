const { validationResult } = require("express-validator/check");
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../config');

const User = require('../models/users');
const EMail = require("./email");

exports.signUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;    
    }    
    const email = req.body.email;
    const password = req.body.password; 
    const name = req.body.name;   

    bcrypt.hash(password, 12).then(hashedPassword =>{
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,           
            posts: []
        });

        user.save().then(results => {           
            let emailData = {
                from: 'Welcome to Simple Social <andrew@andrewvc.net>',
                to: email,
                subject: 'Welcome to the Simple Social!',
                html: `
                      User ${email} has been successfully created.  
                      You can now login to the simple social app.
                      Please let us know if you have any issues.
                      `
              }; 
            EMail.sendEmail(emailData); 
            res.status(201).json({
                message: 'User created successfully!',
                post: results
            });
        }).catch(err => {           
            if(!err.statusCode){
                err.statusCode = 500;
            }            
            next(err);
        });
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }); 
};

exports.login = (req, res, next) => {
      
    const email = req.body.email;
    const password = req.body.password; 
    let loadedUser;
    User.findOne({email: email})
    .then(user =>{
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 401;           
            throw error;    
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);

    })
    .then(isEqual =>{
        if(!isEqual){
            const error = new Error('Password does not match');
            error.statusCode = 401;           
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 
        config.JWTSECRET,
        {expiresIn: '1h'});

        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        });

    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }            
        next(err);
    });
};

exports.getStatus = (req, res, next) => { 
    User.findById(req.userId).then(user => {   
      if(!user) {
        const error = new Error('No user found');
        error.statusCode = 404;
        throw error;
      }else{
        res.status(200).json({
          message: 'Post found successfully!',
          status: user.status
        });
      }
    }).catch(err => {
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })  
  };

  exports.postStatus = async (req, res, next) => {   
    let status = req.body.status;
    User.findById(req.userId).then(async (user) => {
      console.log(user)
      if(!user) {
        const error = new Error('No user found');
        error.statusCode = 404;
        throw error;
      }else{
        user.status = status || "User Status";
        user.save()
        .then(user => { 
            res.status(200).json({
                message: 'User status updated successfully!',
                status: user.status
              });
        }).catch(err => {
            console.log(err);
            if(!err.statusCode){
              err.statusCode = 500;
            }
            next(err);
          });        
      }
    }).catch(err => {
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })  
  };