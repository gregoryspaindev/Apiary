// built in imports
const path = require('path'); // used to create universal paths

// project imports
const rootDir = require('./util/path'); // creates absolute path to project directory
const User = require('./models/userModel'); // import User model

// package imports
const express = require('express');
const bodyParser = require('body-parser'); // parse request bodies
const mongoose = require('mongoose'); // mongoDB ODM helper
const session = require('express-session'); // create sessions
const MongoDBStore = require('connect-mongodb-session')(session); // manage session storage on MongoB
const csrf = require('csurf'); // create and manage CSRF protection tokens
const flash = require('connect-flash'); // manage flash messages

// route imports
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const hiveRoutes = require('./routes/hiveRoutes');

// as named, constant storing MongoDB connection URI
const MONGODB_URI = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4';

// create express function instance
const app = express();

// create new "store" for session storage 
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// store the function to check POST requests for the CSRF token
// to use it as middleware 
const csrfProtection = csrf();

// initialize flash
app.use(flash());

// set view engine to ejs
app.set('view engine', 'ejs');

// parse req body
app.use(bodyParser.urlencoded({extended: false}));

// serve static files
app.use(express.static(path.join(rootDir, 'public')));

// initialize session
app.use(session({secret: 'secret', resave: false, saveUninitialized: false, store: store}));

// custom middleware to pass entire user object to the request because the session doesn't
// store the user methods, just the data. It uses the user id stored in the session to
// search for a user, and if one is found, attaches it to the req.
app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();      
      })
      .catch(err => { console.log(err); });
  } else {
    next();
  }
});

// middleware to check for CSRF token on POST requests
app.use(csrfProtection);

// custom middleware to pass data to all rendered views. This allows the
// data to be accessed as variables inside the views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// handle routing
app.use('/loggedin', authRoutes);
app.use(hiveRoutes);
app.use(homeRoutes);

// handle 404s
app.use((req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page not found!',
    path: ''
  });
})

// connect to the mongoDB server. This returns a promise, once complete
// it will call the app.listen function to start the server.
mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log('connected');
    app.listen(3000)
  })
  .catch(err => {
    console.log(err);
  });


