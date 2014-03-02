var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  provider:  String,
  providerUserId:  String,
  accessToken: String,
  userId: {type: ObjectId, ref: 'User'},
  dateAdded: {type: Date, default: Date.now},
}, { strict: false });

userSchema.methods.getFacebookFriends = function (cb) {
  return this._profileURL = options.profileURL || 'https://graph.facebook.com/me?fields=friends'
}

module.exports = mongoose.model('User', userSchema);