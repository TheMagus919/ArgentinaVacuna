'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DepositoProvincial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DepositoProvincial.belongsToMany(models.CentroDeVacunacion, { through:'DistribucionCentro', foreignKey: 'idDepProv'});
      DepositoProvincial.belongsToMany(models.DepositoNacional, { through:'DistribucionDeposito', foreignKey: 'idDepProv'});
      DepositoProvincial.belongsToMany(models.LoteProveedor, { through:'DistribucionDeposito', foreignKey: 'idDepProv'});
      DepositoProvincial.hasMany(models.DistribucionCentro, { foreignKey: 'idDepProv' });
      DepositoProvincial.hasMany(models.DistribucionDeposito, { foreignKey: 'idDepProv' })
    }
  }
  DepositoProvincial.init({
    idDepProv: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
  },
  provincia: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  localidad: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  direccion: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "DepositoProvincial",
    tableName: "depositoProvincial",
  });
  return DepositoProvincial;
};