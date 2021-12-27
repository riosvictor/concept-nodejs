const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if (!user){
    return response.status(400).json({error: "User not exists!"});
  }

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userFounded = users.find(user => user.username === username);

  if (userFounded){
    return response.status(400).json({error: "Username already exists!"});
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request.headers;
  
  const userIndex = users.findIndex(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params
  const {username} = request.headers;
  
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1){
    return response.status(404).json({error: "Todo not found!"})
  }

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    title,
    deadline: new Date(deadline)
  };

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {username} = request.headers;
  
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1){
    return response.status(404).json({error: "Todo not found!"})
  }

  if (users[userIndex].todos[todoIndex].done === true){
    return response.status(400).json({error: "Todo already done!"})
  }

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    done: true
  };

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {username} = request.headers;
  
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1){
    return response.status(404).json({error: "Todo not found!"})
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send()
});

module.exports = app;