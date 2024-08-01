'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoteProveedor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoteProveedor.belongsTo(models.Laboratorio, { foreignKey: 'idLab' });
      LoteProveedor.belongsTo(models.TipoVacuna, { foreignKey: 'idTipoVacuna' });
      LoteProveedor.belongsToMany(models.DepositoNacional, { through:'TrasladoDeposito', foreignKey: 'nroLote'});
      LoteProveedor.belongsToMany(models.DepositoProvincial, { through:'DistribucionDeposito', foreignKey: 'nroLote'});
      LoteProveedor.belongsToMany(models.CentroDeVacunacion, { through:'DistribucionCentro', foreignKey: 'nroLote'});
      LoteProveedor.hasMany(models.Aplicacion, { foreignKey: 'nroLote' });
      LoteProveedor.hasMany(models.Descarte, { foreignKey: 'nroLote' });
      LoteProveedor.hasMany(models.Traslado, { foreignKey: 'nroLote' });
      LoteProveedor.hasMany(models.DistribucionCentro, { foreignKey: 'nroLote' });
      LoteProveedor.hasMany(models.DistribucionDeposito, { foreignKey: 'nroLote' });
      LoteProveedor.hasMany(models.TrasladoDeposito, { foreignKey: 'nroLote' });
    }
  }
  LoteProveedor.init({
    nroLote: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idLab: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
    idTipoVacuna: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
    tipoDeFrasco:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombreComercial: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cantidadDeVacunas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fechaDeFabricacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    fechaDeVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    vencidas:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "LoteProveedor",
    tableName: "loteProveedor",
  });
  return LoteProveedor;
};