'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AgenteDeSalud extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AgenteDeSalud.hasMany(models.Aplicacion, { foreignKey:'dniAgente'})
      AgenteDeSalud.belongsToMany(models.CentroDeVacunacion, { through:'Aplicacion', foreignKey:'dniAgente'})
    }
  }
  AgenteDeSalud.init({
    dniAgente: {
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
    matricula: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "AgenteDeSalud",
    tableName: "agenteDeSalud",
  });
  return AgenteDeSalud;
};