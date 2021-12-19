const dateFns = require("date-fns");

class View {
  constructor() {
    this.leftContainer = document.querySelector("#left-container");
    this.rightContainer = document.querySelector("#right-container");
    this.overlay = document.querySelector("#overlay");
  }

  _createElement(tag, className, id) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (id) {
      element.id = id;
    }
    return element;
  }

  _createSpan(text) {
    const span = this._createElement("span");
    const node = document.createTextNode(text);
    span.appendChild(node);
    return span;
  }

  _createParagraph(text) {
    const paragraph = this._createElement("p");
    const node = document.createTextNode(text);
    paragraph.appendChild(node);
    return paragraph;
  }

  _createTitle(level, text) {
    const title = this._createElement("h" + level);
    const node = document.createTextNode(text);
    title.appendChild(node);
    return title;
  }

  _createTodoItem(project, todo) {
    const item = this._createElement("li");

    const div = this._createElement("div");
    const checkbox = this._createElement("input");
    const title = this._createSpan(todo.title);
    const dueDate = this._createSpan(todo.dueDate.substring(0, 10));

    const box = this._createTodoBox(project, todo);

    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const onOverlayClick = (e) => {
      this._hideTodoBox(box);
      this.showProject(project);
    };
    div.addEventListener("click", (e) => {
      this._showOverlay(onOverlayClick);
      this._showTodoBox(box);
    });

    checkbox.addEventListener("change", (e) => {
      this.onCompleteTodo(todo);
    });
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    dueDate.style.float = "right";

    div.appendChild(checkbox);
    div.appendChild(title);
    div.appendChild(dueDate);

    item.appendChild(div);
    item.appendChild(box);

    return item;
  }

  _createTodoBox(project, todo) {
    const box = this._createElement("div", "todo-box");
    const content = this._createElement("div", "todo-box-content");
    const title = this._createElement("input", "todo-box-input");
    const desc = this._createElement("textarea", "todo-box-input");

    const trash = this._createElement("i", "fas fa-trash");
    const calendar = this._createElement("i", "fas fa-calendar");
    const dateInput = this._createElement("input");

    const onInputChange = (e) => {
      this.onChangeTodo(todo, title.value, desc.value, dateInput.value);
    };

    title.type = "text";
    title.value = todo.title;
    title.addEventListener("change", onInputChange);

    desc.value = todo.description;
    desc.rows = 3;
    desc.cols = 50;
    desc.placeholder = "Notes";
    desc.addEventListener("change", onInputChange);

    trash.addEventListener("click", (e) => {
      this._hideOverlay();
      this.onDeleteTodo(project, todo);
    });

    dateInput.style.display = "none";
    dateInput.type = "date";
    dateInput.value = todo.dueDate.substring(0, 10);
    dateInput.addEventListener("change", onInputChange);
    calendar.addEventListener("click", (e) => {
      if (dateInput.style.display === "block") {
        dateInput.style.display = "none";
      } else {
        dateInput.style.display = "block";
      }
    });

    content.appendChild(title);
    content.appendChild(desc);

    box.appendChild(content);
    box.appendChild(trash);
    box.appendChild(calendar);
    box.appendChild(dateInput);

    return box;
  }

  _createNewForm(text, callback) {
    const item = this._createElement("li");
    const btn = this._createElement("button");
    const label = this._createSpan(text);
    const input = this._createElement("input");

    input.type = "text";

    btn.appendChild(label);

    btn.addEventListener("click", (e) => {
      if (input.value) {
        callback(input.value);
      }
    });

    item.appendChild(input);
    item.appendChild(btn);

    return item;
  }

  _onProjectClick(item, project) {
    const items = document.querySelectorAll("#left-container ul li");
    items.forEach((element) => {
      element.classList.remove("active");
    });
    item.classList.add("active");
    this.showProject(project);
  }

  showProjectList(projects) {
    const appTitle = this._createTitle(1, "Todo app");
    const list = this._createElement("ul");
    const form = this._createNewForm("New project", (value) => {
      this.onNewProject(value);
    });

    this.leftContainer.innerHTML = "";

    for (const project of projects) {
      const item = this._createElement("li");
      item.innerHTML = project.name;
      item.addEventListener("click", (e) => {
        this._onProjectClick(item, project);
      });

      list.appendChild(item);
    }

    list.appendChild(form);

    this.leftContainer.appendChild(appTitle);
    this.leftContainer.appendChild(list);
  }

  showProject(project) {
    const projectName = this._createTitle(2, project.name);
    const list = this._createElement("ul");
    const form = this._createNewForm("New todo", (value) => {
      this.onNewTodo(project, value);
    });

    this.rightContainer.innerHTML = "";

    for (const todo of project.todos) {
      const item = this._createTodoItem(project, todo);
      list.appendChild(item);
    }

    list.appendChild(form);

    this.rightContainer.appendChild(projectName);
    this.rightContainer.appendChild(list);
  }

  _showOverlay(handle) {
    this.overlay.style.display = "block";
    this.overlay.onclick = (e) => {
      this._hideOverlay();
      handle();
    };
  }

  _hideOverlay() {
    this.overlay.style.display = "none";
  }

  _showTodoBox(box) {
    box.style.display = "block";
  }

  _hideTodoBox(box) {
    box.style.display = "none";
  }
}

module.exports = View;
