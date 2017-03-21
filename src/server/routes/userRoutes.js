var express = require('express');
var router = express.Router();
const userCtrl = require('../controllers/UserController');

router.get('/logIn',userCtrl.logIn);
router.get('/logOut', userCtrl.logOut);
router.get('/signUp', userCtrl.signUp);
//router.get('/user/:id', userCtrl.show);

module.exports = router;

