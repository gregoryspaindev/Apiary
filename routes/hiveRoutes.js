// import Express
const express = require('express');

// import hive controller and authentication middleware
const hiveController = require('../controllers/hiveController');
const isAuth = require('../middleware/is-auth');

// create Router instance
const router = express.Router();

// handle routes
router.post('/create-hive', isAuth, hiveController.postAddHive);

// export router
module.exports = router;