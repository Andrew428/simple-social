const JWTSECRET = '';
const DB_USERNAME = '';
const DB_PASSWORD = '';
const DB_NAME = '';

module.exports = {
    MONGODB_URI : `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-gfqrh.mongodb.net/${DB_NAME}`,
    ENV : process.env.NODE_ENV,
    MAILGUN_KEY : '',
    MAILGUN_DOMAIN : '',
    JWTSECRET : JWTSECRET
};
