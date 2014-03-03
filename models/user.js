var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  provider:  String,
  providerUserId:  String,
  token: String,
  userId: {type: ObjectId, ref: 'User'},
  dateAdded: {type: Date, default: Date.now},
}, { strict: false });

module.exports = mongoose.model('User', userSchema);