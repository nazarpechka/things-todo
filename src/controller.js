const Model = require('./model');

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.onNewProject = this.onNewProject.bind(this);
    this.view.onNewTodo = this.onNewTodo.bind(this);
    this.view.onDeleteTodo = this.onDeleteTodo.bind(this);
    this.view.onCompleteTodo = this.onCompleteTodo.bind(this);
    this.view.onChangeTodo = this.onChangeTodo.bind(this);
  }

  init() {
    this.model.load();
    this.onProjectListChange();
  }

  onProjectListChange() {
    this.view.showProjectList(this.model.projects);
    this.model.save();
  }

  onTodoListChange(project) {
    this.view.showProject(project);
    this.model.save();
  }

  onNewProject(name) {
    this.model.addProject(name, () => this.onProjectListChange());
  }

  onNewTodo(project, title) {
    Model.addTodo(project, title, () => this.onTodoListChange(project));
  }

  onDeleteTodo(project, todo) {
    Model.deleteTodo(project, todo, () => this.onTodoListChange(project));
  }

  onCompleteTodo(todo) {
    Model.completeTodo(todo);
    this.model.save();
  }

  onChangeTodo(todo, title, description, dueDate) {
    Model.changeTodo(todo, title, description, dueDate);
    this.model.save();
  }
}

module.exports = Controller;
