const Todo = require('./todo');
const Project = require('./project');

class Model {
  constructor() {
    this.projects = [
      new Project('Default', [new Todo('Test', 'this is a good todo')]),
    ];
  }

  static createTodo(title, description = '') {
    return new Todo(title, description);
  }

  static addTodo(project, title, callback) {
    project.todos.push(Model.createTodo(title));
    callback();
  }

  static deleteTodo(project, todo, callback) {
    // eslint-disable-next-line no-param-reassign
    project.todos = project.todos.filter((el) => el !== todo);
    callback();
  }

  addProject(name, callback) {
    this.projects.push(new Project(name));
    callback();
  }

  static completeTodo(todo) {
    todo.toggleCompleted();
  }

  static changeTodo(todo, title, description, dueDate) {
    // eslint-disable-next-line no-param-reassign
    todo.title = title;
    // eslint-disable-next-line no-param-reassign
    todo.description = description;
    // eslint-disable-next-line no-param-reassign
    todo.dueDate = dueDate;
  }

  save() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }

  load() {
    if (localStorage.getItem('projects')) {
      this.projects = JSON.parse(localStorage.getItem('projects'));
      this.projects.forEach((project) => {
        // eslint-disable-next-line no-param-reassign
        project.todos = project.todos.map(
          (todo) =>
            new Todo(todo.title, todo.description, todo.dueDate, todo.completed)
        );
      });
    }
  }
}

module.exports = Model;
