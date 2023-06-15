//Imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;

//instantiate server
var server = express();

//body parser configuration
server.use(bodyParser.urlencoded({ extended: true}));
server.use(bodyParser.json());

// Configure les routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bienvenue sur mon serveur :3</h1>');
});

server.use('/api', apiRouter);

//lauch server
server.listen(8080, function() {
    console.log('Server en ecoute :3');
});