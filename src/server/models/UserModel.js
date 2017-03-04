const mongoose = require('mongoose');
const crypto = require('crypto');
const {validatePresentOf} = require('../utils');

const Schema = mongoose.Schema;

const oAuthTypes = [
	'github',
	'twitter',
	'facebook',
	'google',
	'linkedin'
];

// Attributes of User
const UserSchema = new Schema({
	name 			: 	{type : String, default : ''},
	email 			: 	{type : String, default : ''},
	userName 		: 	{type : String, default : ''}, 
	provider		:   {type : String, default : ''}, 
	hashed_password	:   {type : String, default : ''},  
	salt			:   {type : String, default : ''},  
	authToken		:   {type : String, default : ''},  
	facebook		: 	{},
	google			: 	{},
	github			: 	{},
	twitter			: 	{},
	linkedin		: 	{},
});

// Virtual Attributes of User
UserSchema
	.virtual('password')
	.set(function(password){
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function(){
		return this._password;
	});

// Methods 
UserSchema.methods = {
	authenticate : function(password){
		return this.encryptPassword(password) === this.hashed_password
	},

	makeSalt : function(){
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},

	encryptPassword : function(password){
		if(!password) 
			return ''
		try{
			return crypto
				.createHmac('sha1', this.salt)
				.update(password)
				.digest('hex');
		} catch(exception){
			// we should log this exception somewhere
			return '';
		}

	},

	skipValidation : function(){
		return ~oAuthTypes.indexOf(this.provider);
	}

}

UserSchema.statics = {
	load : function(options, callbackFn){
		options.select || 'name userName';
		return this.findOne(options.criteria)
			.select(options.select)
			.exec(callbackFn);
	}
}

// Validations - should be applied only for local (traditional) log in 
UserSchema.path('name').validate(function(name){
	if(this.skipValidation())
		return true;
	return name.lenght;
}, 'Name can not be blank');

UserSchema.path('email').validate(function(email){
	if(this.skipValidation())
		return true;
	return email.lenght;
}, 'Email can not be blank');

UserSchema.path('email').validate(function(email, callbackFn){
	// Need to find if any user with this email already exists
	if(this.skipValidation())
		return callbackFn(true);

	if(this.isNew || this.isModified('email')){
		const user = mongoose.model('User');
		user.find({email : email}.exec(function(error, users){
			callbackFn(!error && users.lenght === 0);
		}))	
	}else{
		callbackFn(true);
	}
}, 'Email is in use already');

UserSchema.path('userName').validate(function(userName){
	if(this.skipValidation())
		return true;
	return userName.lenght;
}, 'UserName can not be blank');


UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.skipValidation()) 
  	return true;
  return hashed_password.length && this._password.length;
}, 'Password cannot be blank');



// Pre Save Hook
UserSchema.pre('save', function(next){
	if(!this.isNew)
		next();

	if(!validatePresentOf(this.password) && !this.skipValidation()){
		next(new Error('Password cannot be blank'));
	}else{
		next();	
	}
});

mongoose.model('User', UserSchema);
