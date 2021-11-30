const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

function checkTodoId(request, response, next) {
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  request.userTodo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checksExistsUserAccount = users.some(
    (users) => users.username === username
  );

  if (checksExistsUserAccount) {
    return response.status(400).json({ error: "User already exist!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todosProperties = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todosProperties);

  return response.status(201).send();
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoId,
  (request, response) => {
    const { title, deadline } = request.body;

    const { user, userTodo: todo } = request;

    todo.title = title;
    todo.deadline = deadline;

    return response.status(200).json(todo);

    console.log(user.id);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkTodoId,
  (request, response) => {
    const { userTodo: todo } = request;

    todo.done = true;

    return response.status(200).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoId,
  (request, response) => {
    const { user, userTodo: todo } = request;

    user.todos = user.todos.filter((todo) => todo.id == request.params.id);

    return response.status(200).json(todo);
  }
);

module.exports = app;
