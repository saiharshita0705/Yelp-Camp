const express = require('express');
const router = express.Router({mergeParams: true}); //to get params like id from campground router

const Review = require('../models/review')
const Campground = require('../models/campground');

const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post('/', isLoggedIn, validateReview,catchAsync(reviews.createReview))  //create a review

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview)) //this helps to delete from campground dependency also

module.exports = router;





//MVC model view control.