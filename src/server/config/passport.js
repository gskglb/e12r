const config          = require('config');
const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth2').Strategy;
const LocalStrategy   = require('passport-local').Strategy;
const requestPromise  = require('request-promise');
 
const User            = require('../models/UserModel');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


/**
 * Used to findOrCreateUser for any provider.
 * Utilizes the buildUpdatedAttributes function so we can
 * either create or update a user with updated attributes
 *
 * @param {String} provider (Google, Twitter, Facebook, LinkedIn, etc)
 * @param {String} social_id unique identification of the user with the OAuth provider
 * @param {Object} profile some user information object returned by the OAuth provider
 * @param {Object} attributes partially complete object of user attributes only containing
 *   authentication information (access token, etc).
 * 
 * @return {User} created or updated user
 */
function findOrCreateUser(provider, social_id, profile, attributes) {
  return User.findOne({where: {provider: provider, social_id: social_id}}).then(function(user) {
    if (user) {
   
      attributes = buildUpdatedAttributes(provider, social_id, profile, user, attributes);
      return user.update(attributes).then(function(updatedUser) {
        return updatedUser;
      }).catch(function(error) {
        throw error;
      });
    
    } else {
      /**
       * User does not exist, build complete attributes
       * object and create user in the database
       */
      attributes = buildCompleteAttributes(provider, social_id, profile, user, attributes);
      return User.create(attributes).then(function(newUser) {
        return newUser;
      }).catch(function(error) {
        throw error;
      });
    }
    // User exists
  }).catch(function(error) {
    throw error;
  });
}

/**
 * Below are utility functions to build user attribute objects based
 * on whether they are being logged in and UPDATED, or logged in and
 * CREATED. Basically the difference is that when we log in an already
 * existing user we only update authentication information (access token, etc)
 * and the profile picture. This is subject to change.
 */

/**
 * UPDATE user attributes
 * Build updated list of attributes that a logged in user will need
 * to be UPDATED with (profile_picture, last active, OAuth authentication information).
 * Works for any provider* though a more maintainable implementation
 * would be ideal. Issue is that each provider packages the same
 * information slightly differently so we must deal with that somewhere
 *
 * @param {String} provider (Google, Twitter, Facebook, LinkedIn, etc)
 * @param {String} social_id unique identification of the user with the OAuth provider
 * @param {Object} profile some user information object returned by the OAuth provider
 * @param {Object} attributes partially complete object of user attributes we will finish
 *   filling out here
 * 
 * @return {Object} updatedUserAttributes object containing all the attributes needed to update
 *   a user in the database with
 */
function buildUpdatedAttributes(provider, social_id, profile, user, attributes) {
  const updatedUserAttributes = {};
  if(provider == 'google') {
    updatedUserAttributes = {
      profile_picture: profile.photos[0].value.split("?")[0],
      last_active: Math.trunc(Date.now()/1000),
      access_token: attributes.access_token,
      access_token_exp: user.access_token_exp,
      refresh_token: attributes.refresh_token || user.refreshToken
    };
  } else if(provider == 'twitter') {
    updatedUserAttributes = {
      profile_picture: profile.photos[0].value,
      last_active: Math.trunc(Date.now()/1000),
      access_token: attributes.access_token,
      access_token_secret: attributes.access_token_secret
    };
  }
  
  return updatedUserAttributes;
}

/**
 * CREATE all user attributes
 * Build list of attributes that a newly created user will need
 * to to have associated with them in the database. See /models/user.js
 * 
 * @param {String} provider (Google, Twitter, Facebook, LinkedIn, etc)
 * @param {String} social_id unique identification of the user with the OAuth provider
 * @param {Object} profile some user information object returned by the OAuth provider
 * @param {Object} attributes partially complete object of user attributes we will
 *   completely fill in here
 * 
 * @return {Object} completeUserAttributes object containing all the attributes needed to add
 *   a user to the database
 */
function buildCompleteAttributes(provider, social_id, profile, user, attributes) {
  const completeUserAttributes;
  if(provider == 'google') {
    completeUserAttributes = {
      social_id: social_id,
      name: profile.displayName,
      username: profile.email.split("@")[0],
      email: profile.email,
      profile_picture: profile.photos[0].value.split("?")[0],
      provider: provider,
      last_active: Math.trunc(Date.now()/1000),
      access_token: attributes.access_token,
      refresh_token: attributes.refresh_token
    };
  } else if(provider == 'twitter') {
    completeUserAttributes = {
      social_id: social_id,
      name: profile.displayName,
      username: profile.username,
      email: null,
      profile_picture: profile.photos[0].value,
      provider: provider,
      last_active: Math.trunc(Date.now()/1000),
      access_token: attributes.access_token,
      access_token_secret: attributes.access_token_secret
    };
  }
  
  return completeUserAttributes;
}

/**
 * PassportJS Local strategy specifics
 * Configuration details are not necessary in the
 * /config/default.json or production file for local strategy.
 */
passport.use(
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(request, username, password, done) {
    process.nextTick(function() {      
      /**
       * Find one user with the given username
       * Verify that one exists, that the user has
       * the local provider, and that the password hashs
       * match correctly.
       */
      return User.findOne({where: {username: username, provider: 'local'}}).then(function(user) {
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      }).catch(function(error) {
        return done(error);
      }); // end User.findOne()

    }); // end process.newTick()

  }) // end function(request...) & new google strategy

); // end passport.use()

passport.use(

  new GoogleStrategy({
    clientID         : config.get('oauthCredentials.google.id'),
    clientSecret     : config.get('oauthCredentials.google.secret'),
    callbackURL      : config.get('oauthCallbacks.googleCallbackUrl'),
    passReqToCallback: true
  },
    
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      /**
       * Build attributes object containing
       * authentication data that will be stored in database
       */
      
      const attributes = {
        access_token  : accessToken,
        refresh_token : refreshToken
      };
      /**
       * Find or create user with the unique information provided as well
       * as attributes object so it can update or create user with
       * the authentication information we got
       */
      
      return findOrCreateUser('google', profile.id, profile, attributes).then(function(user) {
        return done(null, user);
      }).catch(function(error) {
        console.log("Error in passport.js configuration file");
        console.log(error);
        return done(null);
      }); // end findOrCreateUser()

    }); // end process.newTick()

  }) // end function(request...) & new google strategy

); // end passport.use()


