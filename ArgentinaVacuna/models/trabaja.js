'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trabaja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Trabaja.belongsTo(models.CentroDeVacunacion, { foreignKey: 'idCentro' });
      Trabaja.belongsTo(models.DepositoProvincial, { foreignKey: 'idDepProv' });
      Trabaja.belongsTo(models.AgenteDeSalud, { foreignKey: 'dniAgente' });
      Trabaja.belongsTo(models.Laboratorio, { foreignKey: 'idLab' });
    }
  }
  Trabaja.init({
    idTrabaja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
    dniAgente: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
  },
    idCentro: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
  },
    idLab: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
  },
    idDepProv:{
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
  }},
  {
    sequelize,
    timestamps: false,
    modelName: "Trabaja",
    tableName: "trabaja",
  });
  return Trabaja;
};