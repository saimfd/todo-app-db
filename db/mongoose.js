const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var db = 'mongodb://localhost/TodoApp';
mongoose.connect(process.env.MONGODB_URI || db);

module.exports = {
  mongoose: mongoose
}
