
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
// var Book = require('./models/book.model');
var {mongoose} = require('./../db/mongoose');
var {Todo} = require('./../models/todo.model');
var {User} = require('./../models/user.model');
var {ObjectID} = require('mongodb')
const port = process.env.PORT || 3000;
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

app.listen(port, function(){
  console.log("Started on port " + port);
})

module.exports = {app}
