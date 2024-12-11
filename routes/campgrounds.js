const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds');

const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {campgroundSchema, reviewSchema} = require('../schemas')
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage});



router.route('/')
    .get(catchAsync(campgrounds.index))   // function is moved to controller
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))    //new campground making
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send('It worked!!!');
    // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);  //opens new campground creating page

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))   // shows the particlar campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) // editing/updating the campground. here 'image' must match image in ejs edit form
    .delete(isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground)) // deleting a campground



// router.get('/', catchAsync(campgrounds.index))   // function is moved to controller



//router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))    //new campground making

//router.get('/:id', catchAsync(campgrounds.showCampground))   // shows the particlar campground

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))    // shows the particlar campground edit page
 
//router.put('/:id', isLoggedIn, isAuthor,validateCampground, catchAsync(campgrounds.updateCampground)) // editing/updating the campground.
  
// router.delete('/:id', isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground)) // deleting a campground

module.exports = router;

