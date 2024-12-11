const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const users = require('../controllers/users')


router.route('/register')
    .get(users.renderRegister)  // shows register from page
    .post(catchAsync(users.register))   // registering a user

router.route('/login')
    .get(users.renderLogin)  // shows login from page
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login) //logs in


// router.get('/register', users.renderRegister)  // shows register from page

// router.post('/register', catchAsync(users.register))   // registering a user

// router.get('/login', users.renderLogin)  // shows login from page

// router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login) //logs in

router.get('/logout', users.logout)  // logout

module.exports = router;