const Todo = require("./todo.js");
const Project = require("./project.js");

class Model {
  constructor() {
    this.projects = [
      new Project("Default", [new Todo("Test", "this is a good todo")]),
    ];
  }

  createTodo(title, description = "") {
    return new Todo(title, description);
  }

  addTodo(project, title, callback) {
    project.todos.push(this.createTodo(title));
    callback();
  }

  deleteTodo(project, todo, callback) {
    project.todos = project.todos.filter((el) => el !== todo);
    callback();
  }

  addProject(name, callback) {
    this.projects.push(new Project(name));
    callback();
  }

  completeTodo(todo) {
    todo.toggleCompleted();
  }

  changeTodo(todo, title, description, dueDate) {
    todo.title = title;
    todo.description = description;
    todo.dueDate = dueDate;
  }

  save() {
    localStorage.setItem("projects", JSON.stringify(this.projects));
  }

  load() {
    if (localStorage.getItem("projects")) {
      this.projects = JSON.parse(localStorage.getItem("projects"));
      this.projects.forEach((project) => {
        project.todos = project.todos.map((todo) => {
          if (todo) {
            return new Todo(
              todo.title,
              todo.description,
              todo.dueDate,
              todo.completed
            );
          }
        });
      });
    }
  }
}

module.exports = Model;
