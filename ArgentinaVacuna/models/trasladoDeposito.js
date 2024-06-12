'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrasladoDeposito extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TrasladoDeposito.belongsTo(models.LoteProveedor, { foreignKey: 'nroLote' });
      TrasladoDeposito.belongsTo(models.DepositoNacional, { foreignKey: 'idDepNac' })
    }
  }
  TrasladoDeposito.init({
    idTrasladoDep: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
  idDepNac: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
  },
  fechaDeAdquisicion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
  },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "TrasladoDeposito",
    tableName: "trasladoDeposito",
  });
  //sequelize.sync({force:true});
  return TrasladoDeposito;
};