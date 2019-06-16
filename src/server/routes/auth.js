const express = require('express');
const { check, body } = require("express-validator/check");

const User = require('../models/users');

const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

const router = express.Router();

// POST /feed/post
router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req}) => {
            return User.findOne({email: value}).then(user => {
                if(user){
                    return Promise.reject('E-mail alread exist');
                }
            })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 8 }),
    body('name')
        .trim()
        .isLength({ min: 3 }),
],
authController.signUp);


router.post('/login', authController.login)

router.get('/status', isAuth, authController.getStatus);

router.post('/status', 
    body('status')
        .trim()
        .isLength({ min: 1 }),
    isAuth, 
    authController.postStatus);

module.exports = router;