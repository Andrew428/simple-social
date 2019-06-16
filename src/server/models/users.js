const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type:String,
        requiered: true
    },
    password: {
        type:String,
        requiered: true
    },
    name: {
        type:String,
        requiered: true
    },
    status: {
        type:String,
        default: 'I am new'
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, {timestamps: true});

module.exports = mongoose.model('users', userSchema);
