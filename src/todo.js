class Todo {
  constructor(
    title,
    description = '',
    dueDate = new Date().toISOString(),
    completed = false
  ) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.completed = completed;
  }

  toggleCompleted() {
    this.completed = !this.completed;
  }
}

module.exports = Todo;
