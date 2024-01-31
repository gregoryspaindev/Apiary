const express = require('express'); // import express

const router = express.Router(); // create router instance

// handle home route get requests.
router.get('/', (req, res, next) => {
  // req.flash('error') will return an empty array rather than null if no message is set.
  // to prevent displaying, use a message variable to extract the array and check it for
  // length. If it contains any elements, extract the first as the message variable value.
  // If the array is empty, set the message variable to null.
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  // Render the home page view. The view will have access to the values passed in the object. 
  res.render('home', {
    pageTitle: 'Home',
    path: '/',
    errorMessage: message
  });
});

// export router
module.exports = router;