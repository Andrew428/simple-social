const { validationResult } = require("express-validator/check");
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/users');

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err))
}

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;

  let  totalItems = await Post.find().countDocuments().then(count => {
    return count;
  }).catch(err => {
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });

  Post.find({})
  .skip((currentPage -1) * perPage)
  .limit(perPage)
  .then(posts => {
    console.log(posts)
    res.status(200).json({
      message: 'Post created successfully!',
      posts: posts,
      totalItems: totalItems
    });
  }).catch(err => {
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  })  
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;    
  }
  if(!req.file){
    const error = new Error('No imgage found');
    error.statusCode = 422;
    throw error; 
  }
  const title = req.body.title;
  const content = req.body.content; 
  const image = req.file.path;
  let creator; 
  const post = new Post({
    title: title,
    content: content,
    imageUrl: image,
    creator: req.userId
  });
  post.save().then(async results => { 
    const user = await User.findById(req.userId);
    creator = user;
    user.posts.push(post);
    await user.save();

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {_id: creator._id, name: creator.name}
    });
  }).catch(err => {
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.getPost = (req, res, next) => {

  const postId = req.params.postId;

  Post.findById(postId).then(post => {
    console.log(post)
    if(!post) {
      const error = new Error('No post found');
      error.statusCode = 404;
      throw error;
    }else{
      res.status(200).json({
        message: 'Post found successfully!',
        post: post
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

exports.updatePost = (req, res, next) => { 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;    
  }  
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content; 
  let imageUrl = req.body.image;
  if(req.file){    
    imageUrl = req.file.path;
  }
  if(!imageUrl){
    const error = new Error('No imgage found');
    error.statusCode = 422;
    throw error; 
  } 

  Post.findById(postId)
    .then(post => {
      console.log(post);
      if(!post){
        const error = new Error('No post found');
        error.statusCode = 404;
        throw error;
      }
      if(post.creator._id.toString() !== req.userId){
        const error = new Error('No Autherized');
        error.statusCode = 403;
        throw error;
      }
      //Update post
      if(imageUrl !== post.imageUrl){
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save()    
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated successfully!',
        post: result
      })
    })
    .catch(err => {
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  let post = await Post.findById(postId)
    .then(post => {      
      if(!post){
        const error = new Error('No post found');
        error.statusCode = 404;
        throw error;
      } 
      if(post.creator._id.toString() !== req.userId){
        const error = new Error('No Autherized');
        error.statusCode = 403;
        throw error;
      }      
      return post;
    }).catch(err => {
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });
  clearImage(post.imageUrl);
  let user = await User.findById(req.userId)
  .then(user =>{
    if(!user){
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }).catch(err => {
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });
  user.posts.pull(postId);
  await user.save().catch(err => {
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });
  Post.deleteOne({_id: postId})
    .then(result => {
      res.status(200).json({
        message: 'Post found successfully!'
      });    
    }).catch(err => {
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });  
};


