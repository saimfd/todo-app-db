const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var db = 'mongodb://localhost/TodoApp';
mongoose.connect(db);

module.exports = {
  mongoose: mongoose
}
