const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    if(!req.get('Authorization')){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }    
    let decodedToken;
    try{
        const token = req.get('Authorization').split(' ')[1];
        decodedToken = jwt.verify(token, config.JWTSECRET);
    }catch(err) {
        console.log(err);
        err.statusCode = 500;
        throw err;
    }    
    if(!decodedToken){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}