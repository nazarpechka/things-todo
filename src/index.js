const Controller = require('./controller.js');
const Model = require('./model.js');
const View = require('./view.js');

const app = new Controller(new Model(), new View());
app.init();