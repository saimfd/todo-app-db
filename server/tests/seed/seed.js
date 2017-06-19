const {ObjectID} = require('mongodb')
const {Todo} = require('./../../models/todo.model');
const {User} = require('./../../models/user.model');
const jwt = require('jsonwebtoken');


const user1Id = new ObjectID();
const user2Id = new ObjectID();

var users = [{
  _id: user1Id,
  email: "saimfd00@gmail.com",
  password: "coderforlife",
  tokens: [{
    access: 'auth',
    token: jwt.sign(JSON.stringify({_id: user1Id, access: "auth"}), 'abc123').toString()
  }]
}, {
  _id: user2Id,
  email: "saimfd003@gmail.com",
  password: "password2",
  tokens: [{
    access: 'auth',
    token: jwt.sign(JSON.stringify({_id: user2Id, access: "auth"}), 'abc123').toString()
  }]
}];

var todos = [{
  _id: new ObjectID(),
  text: 'Climb the ladder',
  _userId: user1Id
},{
  _id: new ObjectID(),
  text: 'Ride the horse',
  completed: true,
  completedAt: 123,
  _userId: user2Id
}]

var populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos)
  }).then(() => done());
}

var populateUsers = (done) => {
  User.remove({}).then(() => {
    var user1 = new User(users[0]).save();
    var user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => done())
};

module.exports = {
  populateTodos,
  todos,
  users,
  populateUsers
}
