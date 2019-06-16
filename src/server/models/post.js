const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type:String,
        requiered: true
    },
    imageUrl: {
        type:String,
        requiered: true
    },
    content: {
        type:String,
        requiered: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        requiered: true
    },
}, {timestamps: true});

module.exports = mongoose.model('posts', postSchema);

