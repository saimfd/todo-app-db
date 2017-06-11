var config = require('./../config/config')
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
// var Book = require('./models/book.model');
var {mongoose} = require('./../db/mongoose');
var {Todo} = require('./../models/todo.model');
var {User} = require('./../models/user.model');
var {authenticate} = require('./middleware/authenticate.js')
var {ObjectID} = require('mongodb')
const port = process.env.PORT;
app = express()
app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.json({todos})
  }, (e) => {
    res.status(400).send(e)
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send({"error": "ID not valid"})
  }

  Todo.findById(id).then((todo) => {
    if(todo){
      res.send({todo})
    } else {
      return res.status(404).send({'error': 'Todo not found'})
    }
  }).catch((e) => {
    res.status(400).send({"error": "Something went wrong"})
  })

});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send({"error": "ID is invalid"})
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo){
      res.status(404).send({"error": "No document found to delete"})
    } else {
      res.send({todo, deleted: true})
    }
  }).catch((e) => {
    res.send({"error": "An error occured"})
  })

});

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed'])

  if(!ObjectID.isValid(id)){
    return res.status(404).send({"error": "ID not valid"})
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt =  new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null
  }

  Todo.findByIdAndUpdate(id, {
      $set : body
    },
    {new: true}).then((todo) => {
    if(!todo){
      return res.status(404).send()
    }
    return res.send({todo})
  }).catch((e) => {
    res.status(400).send(e);
  })

});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then((user) => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  })
  .catch((e) => {
    res.status(400).send()
  });
});



app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
})

app.listen(port, function(){
  console.log("Started on port " + port);
})

module.exports = {app}
