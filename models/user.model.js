var mongoose = require('mongoose')

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  }
});

module.exports = {User}
