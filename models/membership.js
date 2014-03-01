var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var membershipSchema = new Schema({
  provider:  String,
  providerUserId:  String,
  accessToken: String,
  userId: {type: ObjectId, ref: 'User'},
  dateAdded: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Membership', membershipSchema);