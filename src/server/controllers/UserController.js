const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond } = require('../utils');

const User = mongoose.model('User');

// Loads user profile
exports.load = async(function* (req, res, next, _id) {
	const criteria = {_id};
	try {
		req.profile = yield User.load(criteria);
		if(!req.profile)
			return next(new Error('User not found'));
	}catch(exception){
		return next(exception);
	}
	next();
});

// Creates user
exports.logIn = function(req, res){
	console.log("You are in user controller - log In");
	res.send("Hello");
};



