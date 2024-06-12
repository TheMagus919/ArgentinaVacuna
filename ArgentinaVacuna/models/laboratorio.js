'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Laboratorio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Laboratorio.hasMany(models.LoteProveedor, { foreignKey: 'idLab' });
    }
  }
  Laboratorio.init({
    idLab: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provincia: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: DataTypes.BIGINT,
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
    modelName: "Laboratorio",
    tableName: "laboratorio",
  });
  return Laboratorio;
};