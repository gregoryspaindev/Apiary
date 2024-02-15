const express = require('express');
const { check, body } = require('express-validator/check');

const router = express.Router();

const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');
const User = require('../models/userModel');

router.post('/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req, res, next }) => {
        // check for user with the provided email. If one exists, redirect user to home page.
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              // send a message with the request that will be removed from subsequent requests
              return Promise.reject('User already exists with the provided email.')
            }
            //return res.redirect('/');
          })
        }),
    body('password', 'Please enter a valid password.')
      .isLength({ min: 5 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('The passwords do not match.');
      }
      return true;
    })
  ],
  authController.postUserSignUp
);
router.get('/loggedin', isAuth, authController.getSignIn);
router.post('/signin', authController.postSignIn);
router.post('/logout', authController.postSignOut);

module.exports = router;