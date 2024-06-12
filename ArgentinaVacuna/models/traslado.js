'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Traslado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Traslado.belongsTo(models.CentroDeVacunacion, { as: 'centroEnvia', foreignKey: 'idCentroEnvia' });
      Traslado.belongsTo(models.CentroDeVacunacion, { as: 'centroRecibe', foreignKey: 'idCentroRecibe' });
      Traslado.belongsTo(models.LoteProveedor, { foreignKey: 'nroLote' })
    }
  }
  Traslado.init({
    idTraslado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
    cantidadDeVacunas: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
    nroLote: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
  },
    fechaSalida:{
      type: DataTypes.DATEONLY,
      allowNull: false,
  },
    fechaLlegada:{
      type: DataTypes.DATEONLY,
      allowNull: false,
  },
    idCentroEnvia:{
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
  },
    idCentroRecibe:{
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
  }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Traslado",
    tableName: "traslado",
  });
  //sequelize.sync();
  return Traslado;
};