const {ObjectID} = require('mongodb')
const {Todo} = require('./../../models/todo.model');
const {User} = require('./../../models/user.model');

var todos = [{
  _id: new ObjectID(),
  text: 'Climb the ladder'
},{
  _id: new ObjectID(),
  text: 'Ride the horse',
  completed: true,
  completedAt: 123
}]


var users = [{

}, {

}];


var populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos)
  }).then(() => done());
}

module.exports = {
  populateTodos,
  todos
}
