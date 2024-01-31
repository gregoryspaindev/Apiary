const Hive = require('../models/hiveModel');

exports.postAddHive = (req, res, next) => {
  // get form data
  let hiveName = req.body.hiveName;

  // create new hive with form data
  let hive = new Hive({
    hiveName: hiveName,
    // This is mostly dummy data until form is created
    boxes: [
      {
        size: 'Large',
        position: 1
      },
      {
        size: 'Medium',
        position: 2
      }
    ]
  })

  console.log(hive); // Testing

  hive.save(); // save hive

  // redirect user to the loggedin page
  res.redirect('/loggedin');
}