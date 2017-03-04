	const mongoose = require('mongoose');
	
	// Initialize Mongoose
	const dbURI_local = 'mongodb://127.0.0.1/mean';
	const dbURI_mongolab = 'mongodb://guru4raj:sillylally123@ds061405.mongolab.com:61405/guru4raj';

	mongoose.connect(dbURI_mongolab);
	

	mongoose.connection.on('connected', function(){
		console.log('Mongoose Connection to database succcessfull');
	})

	mongoose.connection.on('error', function(err){
		console.log('Mongoose Connection error ' + err);
	})

	mongoose.connection.on('disconnected', function(){
		console.log('Mongoose disconnected from database succcessfull');
	})

	// Mongoose does not disconnect automatically. Also, we need to inform MongoDB that we want to 
	// we need to implement gracefulShutdown function

