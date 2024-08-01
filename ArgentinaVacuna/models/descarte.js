'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Descarte extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Descarte.belongsTo(models.AgenteDeSalud, { foreignKey:'dniAgente'})
      Descarte.belongsTo(models.LoteProveedor, { foreignKey:'nroLote'})
      Descarte.belongsTo(models.DepositoNacional, { foreignKey:'idDepNac'})
      Descarte.belongsTo(models.DepositoProvincial, { foreignKey:'idDepProv'})
      Descarte.belongsTo(models.CentroDeVacunacion, { foreignKey:'idCentro'})
    }
  }
  Descarte.init({
    idDescarte: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dniAgente: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    nroLote: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    cantidadDeVacunas:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    formaDescarte:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    empresaResponsable:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaDeDescarte: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    idDepNac: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
    },
    idDepProv: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
    },
    idCentro: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Descarte",
    tableName: "descarte",
  });
  return Descarte;
};