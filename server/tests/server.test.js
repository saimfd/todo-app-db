const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo.model');
const {User} = require('./../models/user.model');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);
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


describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  });

});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = "kili@example.com"
    var password = "saimfd000000"

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if(err){
          return done(err)
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e))
      })

  });

  it('should return validation errors if request invalid', (done) => {
    var email = "jaw.como"
    var password = "123"

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done)
  });

  it('should not create user if email in use', (done) => {
    var email = users[0].email
    var password = "saimsss"
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done)
  });
});


describe('POST /users/login', () => {
    it('should return token if user is valid', (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: users[0].email,
          password: users[0].password
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toBe(users[0].tokens[0].token)
        })
        .end((err, res) => {
          if(err){
            return done(err)
          }

          User.findById(users[0]._id).then((user) => {
            expect(user.tokens[0]).toInclude({
              access: "auth",
              token: res.headers['x-auth']
            });
            done();
          }).catch((e) => done(e))

        })
    });

    it('should not return token if user is invalid', (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: "saimfd00@gmail.com",
          password: "poli"
        })
        .expect(400)
        .end((err) => {
          if(err){
            return done(err)
          }
          done()

        })
    });
});
