var models = require('../models');
module.exports = {

    getAllProjet: function(req, res) {
        models.Projet.findAll({
          attributes: ['id', 'title', 'img', 'text1', 'img1', 'text', 'text2', 'img2']
        })
        .then(function(projets){
          if(projets){
            res.status(201).json(projets)
          }else{
            res.status(404).json({ 'error' : 'projets not found'});
          }
        })
        .catch(function(err){
          res.status(500).json({ 'error' : 'cannot fetch all projets'});
        })
      },
}