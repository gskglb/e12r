/**
 * Routing module for handling all routes under /users
 */

/**
 * Import core modules
 */
const express = require('express');
const router  = express.Router();
const models  = require('../../models');
const authenticationHelpers = require('../authenticationHelpers');

// /users/me
router.get('/me', authenticationHelpers.isAuth, function(req, res, next) {
  console.log('/api/user/me');
  res.json({
    "me": {
      "name": req.session.passport.user.name,
      "username": req.session.passport.user.username,
      "profile_picture": req.session.passport.user.profile_picture,
      "last_active": req.session.passport.user.last_active 
    } 
  });
});

// /users/register
const registerUserController = require('../../controllers/user').registerUser;

router.post('/register', authenticationHelpers.isNotAuthOrRedirect, function(request, response, next) {
  console.log('/api/user/register');
  registerUserController(request.body).then(function(user) {
    response.json(user);
  }).catch(function(error) {
    console.log(error);
    response.status(400).json({"reason": error.message});
  });
});

// /users/exists
const userExistsController = require('../../controllers/user').userExists;
router.get('/exists', function(request, response) {
  console.log('/api/user/exists');
  userExistsController(request.query).then(function(exists) {
    response.json({"exists": exists});
  }).catch(function(error) {
    response.status(500).json(error);
  })
});

// /users
const getAllUsersPublicController = require('../../controllers/user').getAllUsersPublic;
router.get('/', authenticationHelpers.isAuth, function(request, response) {
  console.log('/api/user/');
  const offset = request.query.offset || 0;
  const limit = request.query.limit || 50;
  const desc = request.query.desc || false;
  getAllUsersPublicController(offset, limit, desc).then(function(users) {
    response.json(users);
  }).catch(function(error) {
    response.json(error);
  });

});

// /users/:id
const getUserPublicController = require('../../controllers/user').getUserPublic;
router.get('/:id', authenticationHelpers.isAuth, function(request, response) {
  console.log('/api/user/:id');
  getUserPublicController(request.params.id).then(function(user) {
    response.json(user);
  }).catch(function(error) {
    response.json(error);
  });

});

module.exports = router;