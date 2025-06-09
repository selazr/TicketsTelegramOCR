const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Ticket = sequelize.define('Ticket', {
  chat_id: DataTypes.STRING,
  obra: DataTypes.STRING,
  user_name: DataTypes.STRING,
  pais: DataTypes.STRING,
  store: DataTypes.STRING,
  card_last4: DataTypes.STRING,
  total: DataTypes.STRING,
  currency: DataTypes.STRING,
  total_eur: DataTypes.FLOAT,
  date: DataTypes.STRING,
  time: DataTypes.STRING,
  items_json: DataTypes.TEXT,
  location_lat: DataTypes.STRING,
  location_lng: DataTypes.STRING,
  geo_country: DataTypes.STRING,
  geo_city: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'tickets'
});

module.exports = Ticket;
