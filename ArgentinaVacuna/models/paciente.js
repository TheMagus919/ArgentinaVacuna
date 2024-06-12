'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paciente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paciente.hasMany(models.Aplicacion, { foreignKey: 'dniPaciente' });
      Paciente.belongsToMany(models.CentroDeVacunacion, { through:'Aplicacion', foreignKey: 'dniPaciente'})
    }
  }
  Paciente.init({
    dniPaciente: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaDeNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    genero: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false,
  },
    localidad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    celular: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    celularDeRespaldo: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Paciente",
    tableName: "paciente",
  });
  return Paciente;
};