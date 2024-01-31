// import password hashing function
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator/check');

// import the User model
const User = require('../models/userModel');

// function to handle POST requests from the user signup form
exports.postUserSignUp = (req, res, next) => {
  // extract form data
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422)
      .render('home', {
        pageTitle: 'Home',
        path: '/',
        errorMessage: errors.array()[0].msg
    });
  }

  
  // create the user, then redirect the user to the loggedin page.
  bcrypt.hash(password, 12) // adding return creates a promise
    .then(hashedPassword => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword
      });
      return user.save(); // adding return creates a promise
    })
    .then(result => {
      // set session properties
      req.session.isLoggedIn = true;
      req.session.user = result;
      // explicitly calling the .save function prevents the redirect from
      // happening before the session has been updated, ensuring the data
      // is included in the request.
      req.session.save(err => {
        res.redirect('loggedin/loggedin');
      });
    })
    .catch(err => console.log(err));
};

// function to handle GET requests to the loggedin page. Follows the isAuth
// middleware that blocks unauthenticated users.
exports.getSignIn = ((req, res, next) => {
  res.render('loggedin/loggedin', {
    pageTitle: 'Logged In',
    path: '/loggedin'
  });
});

// function to handle POST requests from the sign in form.
exports.postSignIn = (req, res, next) => {
  // extract data from form
  const email = req.body.email;
  const password = req.body.password;

  // check for user with the provided email. If one does not exist, redirect user to home page.
  // If user exists, proceed with checking password.
  User.findOne({email: email})
      .then(user => {
        if (!user) 
        {
          // send a message with the request that will be removed from subsequent requests
          req.flash('error', 'Invlaid email and/or password.')
          return res.redirect('/');
        }

        // check password with bcrypt.compare method. If they match, set session variables
        // and redirect user using the session.save method. If not, redirect the user to
        // the home page.
        bcrypt.compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                if (err) {
                  console.log(err);
                }
                res.redirect('loggedin');
              })
            }
            // send a message with the request that will be removed from subsequent requests
            req.flash('error', 'Invlaid email and/or password.')
            res.redirect('/');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/');
          })
        })
        .catch(err => console.log(err));
};

// function to handle POST requests from the sign out form. Calls the session.destroy
// function, passing a callback function to redirect the user to the home page.
// This removes the session, and since the session stored the "isLoggedIn" value,
// the user is now logged out.
exports.postSignOut = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/')
  });
};