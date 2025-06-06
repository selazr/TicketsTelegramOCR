const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('✅ Conectado a la base de datos MySQL'))
  .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

sequelize.sync({ alter: true }) // usa alter o force según el entorno
  .then(() => console.log('✅ Tablas sincronizadas'))
  .catch(err => console.error('❌ Error al sincronizar tablas:', err));


module.exports = sequelize;
