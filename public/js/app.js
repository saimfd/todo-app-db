var app = angular.module('todoApp', ['ngRoute', 'ngStorage']).run(['$rootScope', '$localStorage', '$http', '$location', 'todos', '$route', function($rootScope, $localStorage, $http, $location,todos, $route) {
  $rootScope.authenticated = false

  if($localStorage.current_user && $localStorage.current_user_token){
      $rootScope.authenticated = true;
      $http.defaults.headers.common['x-auth'] = $localStorage.current_user_token
  }

  if(!$rootScope.authenticated){
    $location.path('/login');
  }
  $rootScope.logout = function(){
    $http.delete('/users/me/token')
      .then((response) => {
        $rootScope.authenticated = false;
        delete $localStorage.current_user;
        delete $localStorage.current_user_token;
        $location.path('/')
      }, (err) => {
        console.log(err);
      })
  }
}]);

app.config(($routeProvider) => {
  $routeProvider.when('/register', {
    templateUrl: '../pages/register.html',
    controller: 'authController'
  })

  .when('/login', {
    templateUrl: '../pages/login.html',
    controller: 'authController'
  })

  .when('/', {
    templateUrl: '../pages/todos.html',
    controller: 'todoController'
  })
})

app.controller('todoController', ['$scope', '$rootScope', '$route','$location', 'todos', function($scope, $rootScope, $route, $location, todos){
  $scope.showTodos = function() {
    todos.async().then(function(response){
      $scope.todos = response.data.todos
    }, (err) => {
      console.log("User not logged in");
    })
  }
  if($rootScope.authenticated){
      $scope.showTodos();
  }
  $scope.addTodo = function() {
    todos.addTodo({
      text: $scope.newTodo
    }).then(function(response){
      $scope.showTodos();
      $scope.newTodo = '';
    })
  }

  $scope.deleteTodo = function(id){
    if(window.confirm('Are you sure you want to delete todo?')){
      todos.deleteTodo(id)
        .then(function(res){
            $route.reload()
        })
    }
  }

  $scope.completeTodo = function(id){
    todos.completeTodo(id, true)
      .then((res) => {
        $route.reload();
      })
  }

  $scope.editTodo = function(id){
    todos.editTodo(id, $scope.todoText).then((res) => {
      $route.reload()
    }, (err) => {
      console.log(err);
    })
  }
}]);

app.controller('authController', ['$scope', '$rootScope', '$http', '$location', '$localStorage', function($scope, $rootScope, $http, $location, $localStorage) {
  // if(!$rootScope.authenticated){
  //   $location.path('/login');
  // }
  $scope.register = function(){
    $http.post('/users', {
      email: $scope.email,
      password: $scope.password
    }).then((response) => {
      $scope.signin(response);
    }, (err) => {
      console.log(err);
    })
  }

  $scope.login = function(){
    $http.post('/users/login', {
      email: $scope.email,
      password: $scope.password
    }).then(function(response){
      $scope.signin(response)
    });
  }



  $scope.signin = function(response){
    $rootScope.authenticated = true;
    $localStorage.current_user = response.data.email
    console.log('Logged in');
    $http.defaults.headers.common['x-auth'] = response.headers('x-auth')
    $localStorage.current_user_token = response.headers('x-auth');
    $location.path('/')
  }
}]);

app.directive('todo', function(){
  return {
    restrict: 'E',
    templateUrl: 'directives/todo.html',
    replace: true,
    controller: 'todoController',
    scope: {
      todoText: '@',
      completed: '=',
      todoId: '@',
      completedAt: '@'
    }
  }
});


app.service('todos', ['$http', function($http){
  var self = this;
  return {
    async: function(){
      return $http.get('/todos')
    },
    addTodo: function(data){
      return $http.post('/todos', data)
    },
    deleteTodo: function(id){
      return $http.delete('/todos/' + id)
    },
    completeTodo: function(id, completed){
      return $http.patch('/todos/' + id, {
        completed: completed
      })
    },
    editTodo: function(id, text){
      return $http.patch('/todos/' + id, {
        text: text
      })
    }
  }
}]);
