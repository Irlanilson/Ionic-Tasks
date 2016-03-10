// Ionic Starter App

// Database instance.
var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('ionic-tasks', ['ionic', 'ngCordova']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    db = window.sqlitePlugin.openDatabase({ name: 'scotch-todo.db'});
    db.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title text, content text, completed integer)");
  });
})

app.controller('main', function ($scope, $ionicModal) { //store the entities name in a variable var taskData = 'task';

  //store the entities name in a variable
  var taskData = 'task';

  //initialize the tasks scope with empty array
  $scope.tasks = [];

  //initialize the task scope with empty object
  $scope.task = {};

  //configure the ionic modal before use
  $ionicModal.fromTemplateUrl('new-task-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.newTaskModal = modal;
  });

  $ionicModal.fromTemplateUrl('edit-task-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.editTaskModal = modal;
  });

  var init = function () {
    console.log("RECUPERANDO TASKS...");
      $scope.tasks = [];
      var query = "select id, title, content, completed from tasks";
      db.transaction(function(transaction) {
        transaction.executeSql(query, [],
          function(tx, result) {
            if(result.rows.length > 0){
                for(var i = 0; i < result.rows.length; i++) {
                    $scope.tasks.push({id: result.rows.item(i).id, title: result.rows.item(i).title, content: result.rows.item(i).content, completed: result.rows.item(i).completed});
                }
                $scope.resultado = result.rows.length + " rows found.";
                console.log(result.rows.length + " rows found.");
            } else {
                $scope.tasks = [];
                console.log("0 rows found.");
            }
          }, function(error){
              console.log(error);
          });
      });
  }

  init();

  $scope.createTask = function() {
    console.log("METODO CRIAR");
    var query = "insert into tasks (title, content, completed) values (?,?,?)";
    db.transaction(function(transaction) {
      transaction.executeSql(query, [$scope.task.title,$scope.task.content, $scope.task.completed],
        function(tx, result) {
          console.log("Insert ID -> " + result.insertId);

          $scope.task = {};
          //close new task modal
          $scope.newTaskModal.hide();
          init();
        },
        function(error){
          console.log("DEU ERRO AO SALVAR: " + error);
      });
    });
  }

  $scope.editTask = function() {
      var query = "update tasks set title = ?, content = ?, completed = ? where id = ?";
      db.transaction(function(transaction) {
        transaction.executeSql(query, [$scope.task.title, $scope.task.content, $scope.task.completed, $scope.task.id],
          function(tx, result) {
            $scope.task = {};
            $scope.editTaskModal.hide();
            console.log("Update OK!");
            init();
          },
          function(error){
            console.log("Update FAIL!");
        });
      });
  }

  $scope.removeTask = function(id) {
      var query = "delete from tasks where id = ?";
      db.transaction(function(transaction) {
        transaction.executeSql(query, [id],
          function(tx, result) {
            console.log("Delete OK!");
            init();
          },
          function(error){
            console.log("Delete FAIL!");
        });
      });
  }

  $scope.completeTask = function () {
      //updates a task as completed
      var query = "update tasks set completed = 1 where id = ?";
      db.transaction(function(transaction) {
        transaction.executeSql(query, [$scope.task.id],
          function(tx, result) {
            console.log("Completed update OK!");
            init();
          },
          function(error){
            console.log("Completed update FAIL!");
        });
      });
  }

  $scope.openTaskModal = function () {
      $scope.newTaskModal.show();
  };

  $scope.openEditTaskModal = function(id){
    var query = "select id, title, content, completed from tasks where id = ?";
    db.transaction(function(transaction) {
      transaction.executeSql(query, [id],
        function(tx, result) {
          if(result.rows.length > 0){
            $scope.task.id = result.rows.item(0).id;
            $scope.task.title = result.rows.item(0).title;
            $scope.task.content = result.rows.item(0).content;
            $scope.task.completed = result.rows.item(0).completed;
            console.log("Achei");
            $scope.editTaskModal.show();
          } else {
              console.log("Nao achei");
          }
        },
        function(error){
          console.log(error);
      });
    });
  };

  $scope.closeTaskModal = function () {
      $scope.newTaskModal.hide();
  };

  $scope.closeEditTaskModal = function () {
      $scope.editTaskModal.hide();
  };
})

