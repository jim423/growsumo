const server = require('socket.io')();
const Todo = require('./todo');
const fs = require('fs');

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // Read data from todo.json
    const firstTodos = JSON.parse(fs.readFileSync('todo.json', 'utf8'));

    // Read data from complete.json
    const firstCompletedTodos = JSON.parse(fs.readFileSync('complete.json', 'utf8'));

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    const todoDB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title);
    });

    const completedDB = firstCompletedTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', {
          todo: todoDB,
          complete: completedDB
        });
    }

    // Sends a message to the client to add only the new todo
    const loadNewTodo = (newTodo) => {
      const newTodoList = [];
      newTodoList.push(newTodo);
      server.emit('add', newTodoList);
    }

    // Sends a message to the client to remove completed todos
    const completedTodo = (t) => {
      server.emit('load', {
        todo: t.todo,
        complete: t.complete
      });
    }

    // Sends a message to the client to remove deleted todos
    const deletedTodo = (t) => {
      server.emit('load', {
        todo: t.todo,
        complete: t.complete
      });
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);
        // Push this newly created todo to our database
        todoDB.push(newTodo);

        // Add new todo to todo.json
        fs.writeFileSync('todo.json', JSON.stringify(todoDB));

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        // reloadTodos();
        loadNewTodo(newTodo);
    });

    // Accepts when a client completes todo
    client.on('complete', (t) => {
        // Remove completed todos from DB
        t.forEach((completedTodo) => {
          todoDB.forEach((todo, i) => {
            if (todo.title === completedTodo) {
              todoDB.splice(i, 1);
              const newTodo = new Todo(title=completedTodo);
              completedDB.push(newTodo);
            }
          });
        });

        // Add complete todo to complete.json
        fs.writeFileSync('complete.json', JSON.stringify(completedDB));

        // Save new todo list to todo.json
        fs.writeFileSync('todo.json', JSON.stringify(todoDB));

        // Send latest todo to the client
        completedTodo({
          todo: todoDB,
          complete: completedDB
        });
    });

    // Accepts when a client deletes todo
    client.on('delete', (t) => {
        // Remove deleted todos from DB
        t.forEach((detetedTodo) => {
          todoDB.forEach((todo, i) => {
            if (todo.title === detetedTodo) {
              todoDB.splice(i, 1);
            }
          });
        });

        // Save new todo list to todo.json
        fs.writeFileSync('todo.json', JSON.stringify(todoDB));

        // Send the latest todos to the client
        deletedTodo({
          todo: todoDB,
          complete: completedDB
        });
    });

    // Accepts when a client deletes completed task
    client.on('deleteTask', (t) => {
        // Remove deleted todos from DB
        t.forEach((detetedTask) => {
          completedDB.forEach((task, i) => {
            if (task.title === detetedTask) {
              completedDB.splice(i, 1);
            }
          });
        });

        // Save new todo list to todo.json
        fs.writeFileSync('complete.json', JSON.stringify(completedDB));

        // Send the latest todos to the client
        deletedTodo({
          todo: todoDB,
          complete: completedDB
        });
    });

    // Send the DB downstream on connect
    reloadTodos();
});

console.log('Waiting for clients to connect');
server.listen(3003);
