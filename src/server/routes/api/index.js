/**
 * Routing module for handling all routes under /api
 */

/**
 * Import core modules
 */
var express = require('express');
var router  = express.Router();
var authenticationHelpers = require('../authenticationHelpers');
var users   =  require('./users');

router.use('/users', users);

router.get('/authenticated', authenticationHelpers.isAuth, function(req, res, next) {
  res.json({"authenticated": true});
});

router.get('/', function(request, response) {
  response.json({"made it": "ok"});
});


module.exports = router;