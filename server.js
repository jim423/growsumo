const server = require('socket.io')();
const Todo = require('./todo');
const fs = require('fs');

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // Read data from data.json
    const firstTodos = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    const DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    }

    // Sends a message to the client to add only the new todo
    const loadNewTodo = (newTodo) => {
      const newTodoList = [];
      newTodoList.push(newTodo);
      server.emit('load', newTodoList);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Add new todo to data.json
        fs.writeFileSync('data.json', JSON.stringify(DB));

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        // reloadTodos();
        loadNewTodo(newTodo);
    });

    // Send the DB downstream on connect
    reloadTodos();
});

console.log('Waiting for clients to connect');
server.listen(3003);
