// import Mongoose
const mongoose = require('mongoose');

// create a SchemaType object which contains the Schema() constructor 
const Schema = mongoose.Schema;

// create the hive schema by calling the Schema constructor. Gets passed to the
// mongoose.model constructor function.
const hiveSchema = new Schema({
  hiveName: {
    type: String,
    required: true
  },
  boxes: {
    type: [{
      size: {
        type: String,
        required: true 
      },
      position: {
        type: Number,
        required: true 
      }
    }],
    required: true
  }
});

// create and export the hive model. The params are the collection name, and the schema.
module.exports = mongoose.model('Hive', hiveSchema);