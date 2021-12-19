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
    this.model.addTodo(project, title, () => this.onTodoListChange(project));
  }

  onDeleteTodo(project, todo) {
    this.model.deleteTodo(project, todo, () => this.onTodoListChange(project));
  }

  onCompleteTodo(todo) {
    this.model.completeTodo(todo);
    this.model.save();
  }

  onChangeTodo(todo, title, description, dueDate) {
    this.model.changeTodo(todo, title, description, dueDate);
    this.model.save();
  }
}

module.exports = Controller;
