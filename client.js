const server = io('http://localhost:3003/');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    console.warn(event);
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });

    // Clear the input
    input.value = '';
    // TODO: refocus the element
    input.focus();
}

function showCompletedTask() {
  // Show completed tasks' list
  $('.complete-task').toggle();
}

// This function selects all todos
function selectAll() {
  $("input[name='todo']").prop('checked', true);
}

// This functions unselects all todos
function unselectAll() {
  $("input[name='todo']").prop('checked', false);
}

// This functions completes todo
function completeTodo() {
  let selectedTodo = [];

  // Get all selected todos
  $("input[name='todo']:checked").each(function(index, todo) {
    selectedTodo.push($(todo).val());
  });

  // Emit the complete todo as some data to the server
  server.emit('complete', selectedTodo);
}

// This function delete todo
function deleteTodo() {
  let selectedTodo = [];

  // Get all selected todos
  $("input[name='todo']:checked").each(function(index, todo) {
    selectedTodo.push($(todo).val());
  });

  // Emit the deleted todo as some data to the server
  server.emit('delete', selectedTodo);
}

// This function selects all completed tasks
function selectAllTask() {
  $("input[name='task']").prop('checked', true);
}

// This functions unselects all tasks
function unselectAllTask() {
  $("input[name='task']").prop('checked', false);
}

// This function deletes completed task
function deleteTask() {
  let selectedTask = [];

  // Get all selected todos
  $("input[name='task']:checked").each(function(index, task) {
    selectedTask.push($(task).val());
  });

  // Emit the deleted task as some data to the server
  server.emit('deleteTask', selectedTask);
}

function render(todo) {

    // Append li tag with input inside it for todo.
    $('#todo-list').append('<li class="list-group-item" >'
    +'<input type="checkbox" name="todo" value="' + todo.title + '" /> '
    + todo.title + '</li>');

}

function renderCompletedTask(todo) {

    // Append li tag with input inside it for todo.
    $('#complete-todo-list').append('<li class="list-group-item" >'
    +'<input type="checkbox" name="task" value="' + todo.title + '" /> '
    + todo.title + '</li>');

}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (t) => {
    $('#todo-list').empty();
    $('#complete-todo-list').empty();
    t.todo.forEach((todo) => render(todo));
    t.complete.forEach((todo) => renderCompletedTask(todo));
});

// This event is for adding a new todo
server.on('add', (todos) => {
    todos.forEach((todo) => render(todo));
});
