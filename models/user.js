var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  userId: {type: ObjectId, ref: 'User'},
  provider: String,
  name:  String,
  username: String,
  fbToken: String,
  gender: String,
  twitterToken: String,
  followCount: Number,
  friendCount: Number,
  ffRatio: Number,
  location: String,
  statusCount: Number,
  facebookId: Number,
  twitterId: Number,
  twitterJoinDate: Date,
  dateAdded: {type: Date, default: Date.now}
}, { strict: false });

userSchema.set('toObject', { getters: true });
module.exports = mongoose.model('User', userSchema);