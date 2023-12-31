//imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

//constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,8}$/;
//routes
module.exports = {
register: function(req, res){

        // ajout et verification nullite parametre

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;

        if (email == null || username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters'});
        }

        if (username.length >= 13 || username.length <=4){
            return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)'});
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid'})
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'Password is not valid must be one lower case letter, one upper case letter, one digit, 4-8 length, and no spaces'})
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email}
                })
                .then(function(userFound) {
                    done(null, userFound );
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            },
            function(userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5,function( err, bcryptedPassword ) {
                        done(null, userFound, bcryptedPassword);
                    });
                }else {
                    return res.status(409).json({ 'error': 'user already exist' });
                }
            },
            function(userFound, bcryptedPassword, done) {
                var newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    isAdmin: 0
                })
                .then(function(newUser) {
                    done(newUser);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'cannot add user code:1' });
                });
            }
        ], function(newUser) {
            if(newUser) {
                return res.status(201).json({ 
                    'userId': newUser.id 
                });
            }else {
                return res.status(500).json({ 'error': 'cannot add user code:2' });
            }
        });
  },
login: function(req, res) {
    
    // Params
    var email    = req.body.email;
    var password = req.body.password;

    if (email == null ||  password == null) {
      return res.status(400).json({ 'error': 'missing parameters' });
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          where: { email: email }
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },
      function(userFound, done) {
        if (userFound) {
          bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
            done(null, userFound, resBycrypt);
          });
        } else {
          return res.status(404).json({ 'error': 'incorrect password' });
        }
      },
      function(userFound, resBycrypt, done) {
        if(resBycrypt) {
          done(userFound);
        } else {
          return res.status(403).json({ 'error': 'user not found' });
        }
      }
    ], function(userFound) {
      if (userFound) {
        return res.status(201).json({
          'userId': userFound.id,
          'token': jwtUtils.generateTokenForUser(userFound)
        });
      } else {
        return res.status(500).json({ 'error': 'cannot log on user' });
      }
    });
  },
getUserProfile: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.User.findOne({
      attributes: [ 'id', 'email', 'username'],
      where: { id: userId }
    }).then(function(user) {
      if (user) {
        res.status(201).json(user);
      } else {
        res.status(404).json({ 'error': 'user not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch user' });
    });
  },
getAllUsers: function(req, res) {
    models.User.findAll({
      attributes: ['id', 'email', 'username']
    })
    .then(function(users){
      if(users){
        res.status(201).json(users)
      }else{
        res.status(404).json({ 'error' : 'users not found'});
      }
    })
    .catch(function(err){
      res.status(500).json({ 'error' : 'cannot fetch all users'});
    })
  },
updateUserProfile: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    // Params
    var bio = req.body.bio;

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'bio'],
          where: { id: userId }
        }).then(function (userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },
      function(userFound, done) {
        if(userFound) {
          userFound.update({
            bio: (bio ? bio : userFound.bio)
          }).then(function() {
            done(userFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update user' });
          });
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      },
    ], function(userFound) {
      if (userFound) {
        return res.status(201).json(userFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update user profile' });
      }
    });
  }
}