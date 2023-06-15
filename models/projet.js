'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Projet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Projet.init({
    title: DataTypes.STRING,
    img: DataTypes.STRING,
    text1: DataTypes.STRING,
    img1: DataTypes.STRING,
    text: DataTypes.STRING,
    text2: DataTypes.STRING,
    img2: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Projet',
  });
  return Projet;
};