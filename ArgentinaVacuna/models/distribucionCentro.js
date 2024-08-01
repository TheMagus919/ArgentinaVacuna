'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DistribucionCentro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DistribucionCentro.belongsTo(models.CentroDeVacunacion, { foreignKey: 'idCentro' , as: 'DistribucionCentroVac'});
      DistribucionCentro.belongsTo(models.LoteProveedor, { foreignKey: 'nroLote' });
      DistribucionCentro.belongsTo(models.DepositoProvincial, { foreignKey: 'idDepProv' })
    }
  }
  DistribucionCentro.init({
    idDisCentro: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nroLote: {
        type: DataTypes.INTEGER,
        foreingKey: true,
        allowNull: false,
    },
    cantidadDeVacunas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idDepProv: {
        type: DataTypes.INTEGER,
        foreingKey: true,
        allowNull: false,
    },
    fechaDeSalidaDepProv: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    idCentro: {
        type: DataTypes.INTEGER,
        foreingKey: true,
        allowNull: false,
    },
    fechaLlegadaCentro: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    descartado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "DistribucionCentro",
    tableName: "distribucionCentro",
  });
  return DistribucionCentro;
};