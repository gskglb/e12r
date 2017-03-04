const userCtrl = require('../controllers/UserController');

module.exports = function(app){

	app.get('/logIn', userCtrl.logIn);
	app.get('/logOut', userCtrl.logOut);
	app.get('/signUp', userCtrl.signUp);
	app.get('/user/:id', userCtrl.show);

};