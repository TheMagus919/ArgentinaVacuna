const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('vacunatorio', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;