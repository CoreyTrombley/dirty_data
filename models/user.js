var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  username: String,
  email:  String,
  name:  String,
  userId: {type: ObjectId, ref: 'User'},
  dateAdded: {type: Date, default: Date.now},
  fbToken: String,
  twitterToken: String,
  accounts: []
}, { strict: false });

module.exports = mongoose.model('User', userSchema);