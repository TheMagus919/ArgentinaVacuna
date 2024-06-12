'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoVacuna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TipoVacuna.hasMany(models.LoteProveedor,{foreignKey:'idTipoVacuna'})
    }
  }
  TipoVacuna.init({
    idTipoVacuna: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "TipoVacuna",
    tableName: "tipoVacuna",
  });
  return TipoVacuna;
};