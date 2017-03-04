const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const join = require('path').join;
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const fs = require('fs');

const app = express();

//Middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Create link to Angular build directory
const distDir = __dirname + "/dist/";
app.use(express.static(distDir));

app.engine('hbs', hbs({
  partialsDir: path.join(__dirname, 'src' ,'server/views/partials'),
  layoutsDir : path.join(__dirname, 'src' ,'server/views/layouts'),
  defaultLayout : 'layout',
  extname : '.hbs'
}));
app.set('views', path.join(__dirname, 'src' ,'server/views'));
app.set('view engine', 'hbs');

// Connect to database
require(path.join(__dirname, 'src' ,'server/config/db'));

// Bootstrap all models to avoid model hasn't been registered error 

// Bootstrap models
const models = path.join(__dirname, 'src' ,'server/models');
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// Setup server side routes
const userRoutes = require(path.join(__dirname, 'src' ,'server/routes/userRoutes'))
app.use('/user', userRoutes);


// Initialize the app.
const src = app.listen(process.env.PORT || 8080, function () {
  const port = src.address().port;
    console.log("App now running on port", port);
});


// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

	