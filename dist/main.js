/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/controller.js":
/*!***************************!*\
  !*** ./src/controller.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Model = __webpack_require__(/*! ./model */ "./src/model.js");

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


/***/ }),

/***/ "./src/model.js":
/*!**********************!*\
  !*** ./src/model.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Todo = __webpack_require__(/*! ./todo */ "./src/todo.js");
const Project = __webpack_require__(/*! ./project */ "./src/project.js");

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


/***/ }),

/***/ "./src/project.js":
/*!************************!*\
  !*** ./src/project.js ***!
  \************************/
/***/ ((module) => {

class Project {
  constructor(name, todos = []) {
    this.name = name;
    this.todos = todos;
  }
}

module.exports = Project;


/***/ }),

/***/ "./src/todo.js":
/*!*********************!*\
  !*** ./src/todo.js ***!
  \*********************/
/***/ ((module) => {

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


/***/ }),

/***/ "./src/view.js":
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
/***/ ((module) => {

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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
const Controller = __webpack_require__(/*! ./controller */ "./src/controller.js");
const Model = __webpack_require__(/*! ./model */ "./src/model.js");
const View = __webpack_require__(/*! ./view */ "./src/view.js");

const app = new Controller(new Model(), new View());
app.init();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxjQUFjLG1CQUFPLENBQUMsK0JBQVM7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDbkRBLGFBQWEsbUJBQU8sQ0FBQyw2QkFBUTtBQUM3QixnQkFBZ0IsbUJBQU8sQ0FBQyxtQ0FBVzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBDQUEwQyxNQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7VUN2T0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7O0FDdEJBLG1CQUFtQixtQkFBTyxDQUFDLHlDQUFjO0FBQ3pDLGNBQWMsbUJBQU8sQ0FBQywrQkFBUztBQUMvQixhQUFhLG1CQUFPLENBQUMsNkJBQVE7O0FBRTdCO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aGluZ3MtdG9kby8uL3NyYy9jb250cm9sbGVyLmpzIiwid2VicGFjazovL3RoaW5ncy10b2RvLy4vc3JjL21vZGVsLmpzIiwid2VicGFjazovL3RoaW5ncy10b2RvLy4vc3JjL3Byb2plY3QuanMiLCJ3ZWJwYWNrOi8vdGhpbmdzLXRvZG8vLi9zcmMvdG9kby5qcyIsIndlYnBhY2s6Ly90aGluZ3MtdG9kby8uL3NyYy92aWV3LmpzIiwid2VicGFjazovL3RoaW5ncy10b2RvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RoaW5ncy10b2RvLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IE1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpO1xuXG5jbGFzcyBDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IobW9kZWwsIHZpZXcpIHtcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgdGhpcy52aWV3ID0gdmlldztcbiAgICB0aGlzLnZpZXcub25OZXdQcm9qZWN0ID0gdGhpcy5vbk5ld1Byb2plY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnZpZXcub25OZXdUb2RvID0gdGhpcy5vbk5ld1RvZG8uYmluZCh0aGlzKTtcbiAgICB0aGlzLnZpZXcub25EZWxldGVUb2RvID0gdGhpcy5vbkRlbGV0ZVRvZG8uYmluZCh0aGlzKTtcbiAgICB0aGlzLnZpZXcub25Db21wbGV0ZVRvZG8gPSB0aGlzLm9uQ29tcGxldGVUb2RvLmJpbmQodGhpcyk7XG4gICAgdGhpcy52aWV3Lm9uQ2hhbmdlVG9kbyA9IHRoaXMub25DaGFuZ2VUb2RvLmJpbmQodGhpcyk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMubW9kZWwubG9hZCgpO1xuICAgIHRoaXMub25Qcm9qZWN0TGlzdENoYW5nZSgpO1xuICB9XG5cbiAgb25Qcm9qZWN0TGlzdENoYW5nZSgpIHtcbiAgICB0aGlzLnZpZXcuc2hvd1Byb2plY3RMaXN0KHRoaXMubW9kZWwucHJvamVjdHMpO1xuICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xuICB9XG5cbiAgb25Ub2RvTGlzdENoYW5nZShwcm9qZWN0KSB7XG4gICAgdGhpcy52aWV3LnNob3dQcm9qZWN0KHByb2plY3QpO1xuICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xuICB9XG5cbiAgb25OZXdQcm9qZWN0KG5hbWUpIHtcbiAgICB0aGlzLm1vZGVsLmFkZFByb2plY3QobmFtZSwgKCkgPT4gdGhpcy5vblByb2plY3RMaXN0Q2hhbmdlKCkpO1xuICB9XG5cbiAgb25OZXdUb2RvKHByb2plY3QsIHRpdGxlKSB7XG4gICAgTW9kZWwuYWRkVG9kbyhwcm9qZWN0LCB0aXRsZSwgKCkgPT4gdGhpcy5vblRvZG9MaXN0Q2hhbmdlKHByb2plY3QpKTtcbiAgfVxuXG4gIG9uRGVsZXRlVG9kbyhwcm9qZWN0LCB0b2RvKSB7XG4gICAgTW9kZWwuZGVsZXRlVG9kbyhwcm9qZWN0LCB0b2RvLCAoKSA9PiB0aGlzLm9uVG9kb0xpc3RDaGFuZ2UocHJvamVjdCkpO1xuICB9XG5cbiAgb25Db21wbGV0ZVRvZG8odG9kbykge1xuICAgIE1vZGVsLmNvbXBsZXRlVG9kbyh0b2RvKTtcbiAgICB0aGlzLm1vZGVsLnNhdmUoKTtcbiAgfVxuXG4gIG9uQ2hhbmdlVG9kbyh0b2RvLCB0aXRsZSwgZGVzY3JpcHRpb24sIGR1ZURhdGUpIHtcbiAgICBNb2RlbC5jaGFuZ2VUb2RvKHRvZG8sIHRpdGxlLCBkZXNjcmlwdGlvbiwgZHVlRGF0ZSk7XG4gICAgdGhpcy5tb2RlbC5zYXZlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyO1xuIiwiY29uc3QgVG9kbyA9IHJlcXVpcmUoJy4vdG9kbycpO1xuY29uc3QgUHJvamVjdCA9IHJlcXVpcmUoJy4vcHJvamVjdCcpO1xuXG5jbGFzcyBNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvamVjdHMgPSBbXG4gICAgICBuZXcgUHJvamVjdCgnRGVmYXVsdCcsIFtuZXcgVG9kbygnVGVzdCcsICd0aGlzIGlzIGEgZ29vZCB0b2RvJyldKSxcbiAgICBdO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZVRvZG8odGl0bGUsIGRlc2NyaXB0aW9uID0gJycpIHtcbiAgICByZXR1cm4gbmV3IFRvZG8odGl0bGUsIGRlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIHN0YXRpYyBhZGRUb2RvKHByb2plY3QsIHRpdGxlLCBjYWxsYmFjaykge1xuICAgIHByb2plY3QudG9kb3MucHVzaChNb2RlbC5jcmVhdGVUb2RvKHRpdGxlKSk7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIHN0YXRpYyBkZWxldGVUb2RvKHByb2plY3QsIHRvZG8sIGNhbGxiYWNrKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgcHJvamVjdC50b2RvcyA9IHByb2plY3QudG9kb3MuZmlsdGVyKChlbCkgPT4gZWwgIT09IHRvZG8pO1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBhZGRQcm9qZWN0KG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wcm9qZWN0cy5wdXNoKG5ldyBQcm9qZWN0KG5hbWUpKTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgc3RhdGljIGNvbXBsZXRlVG9kbyh0b2RvKSB7XG4gICAgdG9kby50b2dnbGVDb21wbGV0ZWQoKTtcbiAgfVxuXG4gIHN0YXRpYyBjaGFuZ2VUb2RvKHRvZG8sIHRpdGxlLCBkZXNjcmlwdGlvbiwgZHVlRGF0ZSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHRvZG8udGl0bGUgPSB0aXRsZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB0b2RvLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdG9kby5kdWVEYXRlID0gZHVlRGF0ZTtcbiAgfVxuXG4gIHNhdmUoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Byb2plY3RzJywgSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9qZWN0cykpO1xuICB9XG5cbiAgbG9hZCgpIHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Byb2plY3RzJykpIHtcbiAgICAgIHRoaXMucHJvamVjdHMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwcm9qZWN0cycpKTtcbiAgICAgIHRoaXMucHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgICAgcHJvamVjdC50b2RvcyA9IHByb2plY3QudG9kb3MubWFwKFxuICAgICAgICAgICh0b2RvKSA9PlxuICAgICAgICAgICAgbmV3IFRvZG8odG9kby50aXRsZSwgdG9kby5kZXNjcmlwdGlvbiwgdG9kby5kdWVEYXRlLCB0b2RvLmNvbXBsZXRlZClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsO1xuIiwiY2xhc3MgUHJvamVjdCB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHRvZG9zID0gW10pIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudG9kb3MgPSB0b2RvcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3Q7XG4iLCJjbGFzcyBUb2RvIHtcbiAgY29uc3RydWN0b3IoXG4gICAgdGl0bGUsXG4gICAgZGVzY3JpcHRpb24gPSAnJyxcbiAgICBkdWVEYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIGNvbXBsZXRlZCA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgdGhpcy5kdWVEYXRlID0gZHVlRGF0ZTtcbiAgICB0aGlzLmNvbXBsZXRlZCA9IGNvbXBsZXRlZDtcbiAgfVxuXG4gIHRvZ2dsZUNvbXBsZXRlZCgpIHtcbiAgICB0aGlzLmNvbXBsZXRlZCA9ICF0aGlzLmNvbXBsZXRlZDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvZG87XG4iLCJjbGFzcyBWaWV3IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZnQtY29udGFpbmVyJyk7XG4gICAgdGhpcy5yaWdodENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyaWdodC1jb250YWluZXInKTtcbiAgICB0aGlzLm92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmxheScpO1xuICB9XG5cbiAgc3RhdGljIF9jcmVhdGVFbGVtZW50KHRhZywgY2xhc3NOYW1lLCBpZCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgfVxuICAgIGlmIChpZCkge1xuICAgICAgZWxlbWVudC5pZCA9IGlkO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHN0YXRpYyBfY3JlYXRlU3Bhbih0ZXh0KSB7XG4gICAgY29uc3Qgc3BhbiA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlKTtcbiAgICByZXR1cm4gc3BhbjtcbiAgfVxuXG4gIHN0YXRpYyBfY3JlYXRlUGFyYWdyYXBoKHRleHQpIHtcbiAgICBjb25zdCBwYXJhZ3JhcGggPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgIHBhcmFncmFwaC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICByZXR1cm4gcGFyYWdyYXBoO1xuICB9XG5cbiAgc3RhdGljIF9jcmVhdGVUaXRsZShsZXZlbCwgdGV4dCkge1xuICAgIGNvbnN0IHRpdGxlID0gVmlldy5fY3JlYXRlRWxlbWVudChgaCR7bGV2ZWx9YCk7XG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgIHRpdGxlLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIHJldHVybiB0aXRsZTtcbiAgfVxuXG4gIF9jcmVhdGVUb2RvSXRlbShwcm9qZWN0LCB0b2RvKSB7XG4gICAgY29uc3QgaXRlbSA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cbiAgICBjb25zdCBkaXYgPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBjaGVja2JveCA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgY29uc3QgdGl0bGUgPSBWaWV3Ll9jcmVhdGVTcGFuKHRvZG8udGl0bGUpO1xuICAgIGNvbnN0IGR1ZURhdGUgPSBWaWV3Ll9jcmVhdGVTcGFuKHRvZG8uZHVlRGF0ZS5zdWJzdHJpbmcoMCwgMTApKTtcblxuICAgIGNvbnN0IGJveCA9IHRoaXMuX2NyZWF0ZVRvZG9Cb3gocHJvamVjdCwgdG9kbyk7XG5cbiAgICBjaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBjaGVja2JveC5jaGVja2VkID0gdG9kby5jb21wbGV0ZWQ7XG5cbiAgICBjb25zdCBvbk92ZXJsYXlDbGljayA9ICgpID0+IHtcbiAgICAgIFZpZXcuX2hpZGVUb2RvQm94KGJveCk7XG4gICAgICB0aGlzLnNob3dQcm9qZWN0KHByb2plY3QpO1xuICAgIH07XG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc2hvd092ZXJsYXkob25PdmVybGF5Q2xpY2spO1xuICAgICAgVmlldy5fc2hvd1RvZG9Cb3goYm94KTtcbiAgICB9KTtcblxuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMub25Db21wbGV0ZVRvZG8odG9kbyk7XG4gICAgfSk7XG4gICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcblxuICAgIGR1ZURhdGUuc3R5bGUuZmxvYXQgPSAncmlnaHQnO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChkdWVEYXRlKTtcblxuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICBpdGVtLmFwcGVuZENoaWxkKGJveCk7XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIF9jcmVhdGVUb2RvQm94KHByb2plY3QsIHRvZG8pIHtcbiAgICBjb25zdCBib3ggPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdkaXYnLCAndG9kby1ib3gnKTtcbiAgICBjb25zdCBjb250ZW50ID0gVmlldy5fY3JlYXRlRWxlbWVudCgnZGl2JywgJ3RvZG8tYm94LWNvbnRlbnQnKTtcbiAgICBjb25zdCB0aXRsZSA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2lucHV0JywgJ3RvZG8tYm94LWlucHV0Jyk7XG4gICAgY29uc3QgZGVzYyA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgJ3RvZG8tYm94LWlucHV0Jyk7XG5cbiAgICBjb25zdCB0cmFzaCA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2knLCAnZmFzIGZhLXRyYXNoJyk7XG4gICAgY29uc3QgY2FsZW5kYXIgPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdpJywgJ2ZhcyBmYS1jYWxlbmRhcicpO1xuICAgIGNvbnN0IGRhdGVJbnB1dCA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICBjb25zdCBvbklucHV0Q2hhbmdlID0gKCkgPT4ge1xuICAgICAgdGhpcy5vbkNoYW5nZVRvZG8odG9kbywgdGl0bGUudmFsdWUsIGRlc2MudmFsdWUsIGRhdGVJbnB1dC52YWx1ZSk7XG4gICAgfTtcblxuICAgIHRpdGxlLnR5cGUgPSAndGV4dCc7XG4gICAgdGl0bGUudmFsdWUgPSB0b2RvLnRpdGxlO1xuICAgIHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIG9uSW5wdXRDaGFuZ2UpO1xuXG4gICAgZGVzYy52YWx1ZSA9IHRvZG8uZGVzY3JpcHRpb247XG4gICAgZGVzYy5yb3dzID0gMztcbiAgICBkZXNjLmNvbHMgPSA1MDtcbiAgICBkZXNjLnBsYWNlaG9sZGVyID0gJ05vdGVzJztcbiAgICBkZXNjLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIG9uSW5wdXRDaGFuZ2UpO1xuXG4gICAgdHJhc2guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICB0aGlzLl9oaWRlT3ZlcmxheSgpO1xuICAgICAgdGhpcy5vbkRlbGV0ZVRvZG8ocHJvamVjdCwgdG9kbyk7XG4gICAgfSk7XG5cbiAgICBkYXRlSW5wdXQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBkYXRlSW5wdXQudHlwZSA9ICdkYXRlJztcbiAgICBkYXRlSW5wdXQudmFsdWUgPSB0b2RvLmR1ZURhdGUuc3Vic3RyaW5nKDAsIDEwKTtcbiAgICBkYXRlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25JbnB1dENoYW5nZSk7XG4gICAgY2FsZW5kYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBpZiAoZGF0ZUlucHV0LnN0eWxlLmRpc3BsYXkgPT09ICdibG9jaycpIHtcbiAgICAgICAgZGF0ZUlucHV0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRlSW5wdXQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGRlc2MpO1xuXG4gICAgYm94LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgIGJveC5hcHBlbmRDaGlsZCh0cmFzaCk7XG4gICAgYm94LmFwcGVuZENoaWxkKGNhbGVuZGFyKTtcbiAgICBib3guYXBwZW5kQ2hpbGQoZGF0ZUlucHV0KTtcblxuICAgIHJldHVybiBib3g7XG4gIH1cblxuICBzdGF0aWMgX2NyZWF0ZU5ld0Zvcm0odGV4dCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBpdGVtID0gVmlldy5fY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBjb25zdCBidG4gPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjb25zdCBsYWJlbCA9IFZpZXcuX2NyZWF0ZVNwYW4odGV4dCk7XG4gICAgY29uc3QgaW5wdXQgPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXG4gICAgaW5wdXQudHlwZSA9ICd0ZXh0JztcblxuICAgIGJ0bi5hcHBlbmRDaGlsZChsYWJlbCk7XG5cbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBpZiAoaW5wdXQudmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2soaW5wdXQudmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaXRlbS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgaXRlbS5hcHBlbmRDaGlsZChidG4pO1xuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBfb25Qcm9qZWN0Q2xpY2soaXRlbSwgcHJvamVjdCkge1xuICAgIGNvbnN0IGl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2xlZnQtY29udGFpbmVyIHVsIGxpJyk7XG4gICAgaXRlbXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB9KTtcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIHRoaXMuc2hvd1Byb2plY3QocHJvamVjdCk7XG4gIH1cblxuICBzaG93UHJvamVjdExpc3QocHJvamVjdHMpIHtcbiAgICBjb25zdCBhcHBUaXRsZSA9IFZpZXcuX2NyZWF0ZVRpdGxlKDEsICdUb2RvIGFwcCcpO1xuICAgIGNvbnN0IGxpc3QgPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGNvbnN0IGZvcm0gPSBWaWV3Ll9jcmVhdGVOZXdGb3JtKCdOZXcgcHJvamVjdCcsICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy5vbk5ld1Byb2plY3QodmFsdWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgcHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCkgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IFZpZXcuX2NyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICBpdGVtLmlubmVySFRNTCA9IHByb2plY3QubmFtZTtcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uUHJvamVjdENsaWNrKGl0ZW0sIHByb2plY3QpO1xuICAgICAgfSk7XG5cbiAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfSk7XG5cbiAgICBsaXN0LmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZENoaWxkKGFwcFRpdGxlKTtcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYXBwZW5kQ2hpbGQobGlzdCk7XG4gIH1cblxuICBzaG93UHJvamVjdChwcm9qZWN0KSB7XG4gICAgY29uc3QgcHJvamVjdE5hbWUgPSBWaWV3Ll9jcmVhdGVUaXRsZSgyLCBwcm9qZWN0Lm5hbWUpO1xuICAgIGNvbnN0IGxpc3QgPSBWaWV3Ll9jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGNvbnN0IGZvcm0gPSBWaWV3Ll9jcmVhdGVOZXdGb3JtKCdOZXcgdG9kbycsICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy5vbk5ld1RvZG8ocHJvamVjdCwgdmFsdWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgIHByb2plY3QudG9kb3MuZm9yRWFjaCgodG9kbykgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX2NyZWF0ZVRvZG9JdGVtKHByb2plY3QsIHRvZG8pO1xuICAgICAgbGlzdC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9KTtcblxuICAgIGxpc3QuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZENoaWxkKHByb2plY3ROYW1lKTtcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZENoaWxkKGxpc3QpO1xuICB9XG5cbiAgX3Nob3dPdmVybGF5KGhhbmRsZSkge1xuICAgIHRoaXMub3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB0aGlzLm92ZXJsYXkub25jbGljayA9ICgpID0+IHtcbiAgICAgIHRoaXMuX2hpZGVPdmVybGF5KCk7XG4gICAgICBoYW5kbGUoKTtcbiAgICB9O1xuICB9XG5cbiAgX2hpZGVPdmVybGF5KCkge1xuICAgIHRoaXMub3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG5cbiAgc3RhdGljIF9zaG93VG9kb0JveChib3gpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBzdGF0aWMgX2hpZGVUb2RvQm94KGJveCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJjb25zdCBDb250cm9sbGVyID0gcmVxdWlyZShcIi4vY29udHJvbGxlclwiKTtcbmNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG5jb25zdCBWaWV3ID0gcmVxdWlyZShcIi4vdmlld1wiKTtcblxuY29uc3QgYXBwID0gbmV3IENvbnRyb2xsZXIobmV3IE1vZGVsKCksIG5ldyBWaWV3KCkpO1xuYXBwLmluaXQoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==