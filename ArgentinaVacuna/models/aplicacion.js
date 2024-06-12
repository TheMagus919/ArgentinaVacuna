'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Aplicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Aplicacion.belongsTo(models.Paciente, { foreignKey: 'dniPaciente' })
      Aplicacion.belongsTo(models.AgenteDeSalud, { foreignKey: 'dniAgente' })
      Aplicacion.belongsTo(models.CentroDeVacunacion, { foreignKey: 'idCentro' })
      Aplicacion.belongsTo(models.LoteProveedor, { foreignKey: 'nroLote' })
    }
  }
  Aplicacion.init({
    idAplicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    dniPaciente: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        allowNull: false,
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
    fechaDeAplicacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    idCentro: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Aplicacion",
    tableName: "aplicacion",
  });
  return Aplicacion;
};
