class View {
  constructor() {
    this.leftContainer = document.querySelector('#left-container');
    this.rightContainer = document.querySelector('#right-container');
    this.overlay = document.querySelector('#overlay');
  }

  static _createElement(tag, className, id) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (id) {
      element.id = id;
    }
    return element;
  }

  static _createSpan(text) {
    const span = View._createElement('span');
    const node = document.createTextNode(text);
    span.appendChild(node);
    return span;
  }

  static _createParagraph(text) {
    const paragraph = View._createElement('p');
    const node = document.createTextNode(text);
    paragraph.appendChild(node);
    return paragraph;
  }

  static _createTitle(level, text) {
    const title = View._createElement(`h${level}`);
    const node = document.createTextNode(text);
    title.appendChild(node);
    return title;
  }

  _createTodoItem(project, todo) {
    const item = View._createElement('li');

    const div = View._createElement('div');
    const checkbox = View._createElement('input');
    const title = View._createSpan(todo.title);
    const dueDate = View._createSpan(todo.dueDate.substring(0, 10));

    const box = this._createTodoBox(project, todo);

    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    const onOverlayClick = () => {
      View._hideTodoBox(box);
      this.showProject(project);
    };
    div.addEventListener('click', () => {
      this._showOverlay(onOverlayClick);
      View._showTodoBox(box);
    });

    checkbox.addEventListener('change', () => {
      this.onCompleteTodo(todo);
    });
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    dueDate.style.float = 'right';

    div.appendChild(checkbox);
    div.appendChild(title);
    div.appendChild(dueDate);

    item.appendChild(div);
    item.appendChild(box);

    return item;
  }

  _createTodoBox(project, todo) {
    const box = View._createElement('div', 'todo-box');
    const content = View._createElement('div', 'todo-box-content');
    const title = View._createElement('input', 'todo-box-input');
    const desc = View._createElement('textarea', 'todo-box-input');

    const trash = View._createElement('i', 'fas fa-trash');
    const calendar = View._createElement('i', 'fas fa-calendar');
    const dateInput = View._createElement('input');

    const onInputChange = () => {
      this.onChangeTodo(todo, title.value, desc.value, dateInput.value);
    };

    title.type = 'text';
    title.value = todo.title;
    title.addEventListener('change', onInputChange);

    desc.value = todo.description;
    desc.rows = 3;
    desc.cols = 50;
    desc.placeholder = 'Notes';
    desc.addEventListener('change', onInputChange);

    trash.addEventListener('click', () => {
      this._hideOverlay();
      this.onDeleteTodo(project, todo);
    });

    dateInput.style.display = 'none';
    dateInput.type = 'date';
    dateInput.value = todo.dueDate.substring(0, 10);
    dateInput.addEventListener('change', onInputChange);
    calendar.addEventListener('click', () => {
      if (dateInput.style.display === 'block') {
        dateInput.style.display = 'none';
      } else {
        dateInput.style.display = 'block';
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

  static _createNewForm(text, callback) {
    const item = View._createElement('li');
    const btn = View._createElement('button');
    const label = View._createSpan(text);
    const input = View._createElement('input');

    input.type = 'text';

    btn.appendChild(label);

    btn.addEventListener('click', () => {
      if (input.value) {
        callback(input.value);
      }
    });

    item.appendChild(input);
    item.appendChild(btn);

    return item;
  }

  _onProjectClick(item, project) {
    const items = document.querySelectorAll('#left-container ul li');
    items.forEach((element) => {
      element.classList.remove('active');
    });
    item.classList.add('active');
    this.showProject(project);
  }

  showProjectList(projects) {
    const appTitle = View._createTitle(1, 'Todo app');
    const list = View._createElement('ul');
    const form = View._createNewForm('New project', (value) => {
      this.onNewProject(value);
    });

    this.leftContainer.innerHTML = '';

    projects.forEach((project) => {
      const item = View._createElement('li');
      item.innerHTML = project.name;
      item.addEventListener('click', () => {
        this._onProjectClick(item, project);
      });

      list.appendChild(item);
    });

    list.appendChild(form);

    this.leftContainer.appendChild(appTitle);
    this.leftContainer.appendChild(list);
  }

  showProject(project) {
    const projectName = View._createTitle(2, project.name);
    const list = View._createElement('ul');
    const form = View._createNewForm('New todo', (value) => {
      this.onNewTodo(project, value);
    });

    this.rightContainer.innerHTML = '';

    project.todos.forEach((todo) => {
      const item = this._createTodoItem(project, todo);
      list.appendChild(item);
    });

    list.appendChild(form);

    this.rightContainer.appendChild(projectName);
    this.rightContainer.appendChild(list);
  }

  _showOverlay(handle) {
    this.overlay.style.display = 'block';
    this.overlay.onclick = () => {
      this._hideOverlay();
      handle();
    };
  }

  _hideOverlay() {
    this.overlay.style.display = 'none';
  }

  static _showTodoBox(box) {
    // eslint-disable-next-line no-param-reassign
    box.style.display = 'block';
  }

  static _hideTodoBox(box) {
    // eslint-disable-next-line no-param-reassign
    box.style.display = 'none';
  }
}

module.exports = View;
