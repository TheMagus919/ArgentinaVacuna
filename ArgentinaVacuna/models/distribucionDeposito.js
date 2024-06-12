'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DistribucionDeposito extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DistribucionDeposito.belongsTo(models.LoteProveedor, { foreignKey: 'nroLote' })
      DistribucionDeposito.belongsTo(models.DepositoProvincial, { foreignKey: 'idDepProv' });
      DistribucionDeposito.belongsTo(models.DepositoNacional, { foreignKey: 'idDepNac' });
    }
  }
  DistribucionDeposito.init({
    idDisDep: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nroLote: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
    cantidadDeVacunas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idDepNac: {
        type: DataTypes.INTEGER,
        foreingKey: true,
        allowNull: false,
    },
    fechaDeSalidaDepNac: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    idDepProv: {
        type: DataTypes.INTEGER,
        foreingKey: true,
        allowNull: false,
    },
    fechaLlegadaDepProv: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "DistribucionDeposito",
    tableName: "distribucionDeposito",
  });
  return DistribucionDeposito;
};