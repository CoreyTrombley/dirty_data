var mongoose = require('mongoose'),
  Schema = mongoose.Schema

var userSchema = mongoose.Schema({
    name: String
});


userSchema.methods.speak = function () {
  var greeting = this.name
    ? "Hello, my name is " + this.name
    : "I don't have a name"
  console.log(greeting);
}

module.exports = mongoose.model('User', userSchema);