const { Sequelize } = require('sequelize');
const logger = require('../services/logger');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

sequelize.authenticate()
  .then(() => logger.info('✅ Conectado a la base de datos MySQL'))
  .catch(err => logger.error(`❌ Error al conectar a la base de datos: ${err}`));

sequelize.sync({ alter: true }) // usa alter o force según el entorno
  .then(() => logger.info('✅ Tablas sincronizadas'))
  .catch(err => logger.error(`❌ Error al sincronizar tablas: ${err}`));


module.exports = sequelize;
