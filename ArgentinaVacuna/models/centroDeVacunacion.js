'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CentroDeVacunacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CentroDeVacunacion.belongsToMany(models.Paciente, { through:'Aplicacion', foreignKey:'idCentro'});
      CentroDeVacunacion.belongsToMany(models.AgenteDeSalud, { through:'Aplicacion', foreignKey:'idCentro'});
      CentroDeVacunacion.hasMany(models.Aplicacion, { foreignKey:'idCentro'})
      CentroDeVacunacion.hasMany(models.DistribucionCentro, { foreignKey: 'idCentro' })
      CentroDeVacunacion.belongsToMany(models.DepositoProvincial,  { through:'DistribucionCentro', foreignKey: 'idCentro'});
      CentroDeVacunacion.belongsToMany(models.LoteProveedor,  { through:'DistribucionCentro', foreignKey: 'idCentro'});
      CentroDeVacunacion.hasMany(models.Traslado, { as: 'trasladosEnviados', foreignKey: 'idCentroEnvia' });
      CentroDeVacunacion.hasMany(models.Traslado, { as: 'trasladosRecibidos', foreignKey: 'idCentroRecibe' });
    }
  }
  CentroDeVacunacion.init({
    idCentro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    provincia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "CentroDeVacunacion",
    tableName: "centroDeVacunacion",
  });
  return CentroDeVacunacion;
};