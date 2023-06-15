//imports
var express = require('express');
var usersCtrl = require('./routes/usersControler');
var messagesCtrl = require('./routes/messagesControler');
var likesCtrl = require('./routes/likesControler');
var projetCtrl = require('./routes/projetControler');
const cors = require('cors');
const projetControler = require('./routes/projetControler');


//router

exports.router = (function() {
    var apiRouter = express.Router();

    apiRouter.use(cors({
        origin: '*'
    }));

    // Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);
    apiRouter.route('/users/list').get(usersCtrl.getAllUsers);

    // Messages routes
    apiRouter.route('/messages/new/').post(messagesCtrl.createMessage);
    apiRouter.route('/messages/').get(messagesCtrl.listMessages);

    // Likes routes
    apiRouter.route('/messages/:messageId/vote/like').post(likesCtrl.likePost);
    apiRouter.route('/messages/:messageId/vote/dislike').post(likesCtrl.dislikePost);

    //Projet routes
    apiRouter.route('/projets/list').get(projetCtrl.getAllProjet);

    return apiRouter;
})();