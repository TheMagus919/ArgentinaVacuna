'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DepositoNacional extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DepositoNacional.belongsToMany(models.LoteProveedor, { through: 'TrasladoDeposito', foreignKey: 'idDepNac' });
      DepositoNacional.belongsToMany(models.DepositoProvincial, { through: 'DistribucionDeposito', foreignKey: 'idDepNac' });
      DepositoNacional.hasMany(models.TrasladoDeposito, { foreignKey: 'idDepNac' })
      DepositoNacional.hasMany(models.DistribucionDeposito, { foreignKey: 'idDepNac' })
    }
  }
  DepositoNacional.init({
    idDepNac: {
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
      unique: true
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
      modelName: "DepositoNacional",
      tableName: "depositoNacional",
    });
  return DepositoNacional;
};