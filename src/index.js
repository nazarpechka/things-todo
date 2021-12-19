const Controller = require("./controller");
const Model = require("./model");
const View = require("./view");

const app = new Controller(new Model(), new View());
app.init();
