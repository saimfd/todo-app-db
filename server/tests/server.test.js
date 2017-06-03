const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../../models/todo.model');

var todos = [{
  _id: new ObjectID(),
  text: 'Climb the ladder'
},{
  _id: new ObjectID(),
  text: 'Ride the horse',
  completed: true,
  completedAt: 123
}]
beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos)
  }).then(() => done());
})

describe("POST /todos", () => {
  it('should create a new todo', (done) => {
    var text = "Test todo text";

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err){
          return done(err)
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch((e) => {
           done(e);
        });
      })
  });

  it('should not create todo with invalid data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err)
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2)
          done()
        }).catch((e) => done(e))

      });
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  });

  it('should return 404 if todo not found', (done) => {
    var objectId = new ObjectID();
    request(app)
      .get(`/todos/${objectId.toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('Todo not found')
      })
      .end(done)
  });

  it('should return 404 for non-object ids', (done) => {
    var id = 123;
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('ID not valid')
      })
      .end(done)
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if(err){
          return done(err)
        }
        Todo.findById(hexId).then((doc) => {
          expect(doc).toNotExist();
          done()
        }).catch((err) => done(err))

      });
  });

  it('should return 404 if todo not found', (done) => {
    var objectId = new ObjectID();
    request(app)
      .delete(`/todos/${objectId.toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('No document found to delete')
      })
      .end(done)
  });

  it('should return 404 if id is invalid', (done) => {
    var id = 123;
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('ID is invalid')
      })
      .end(done)
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var body = {
      text: "Go to park",
      completed: true
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe("Go to park")
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeA('number')
      })
      .end(done)
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString()
    var body = {
      completed: false
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done)
  });

});
