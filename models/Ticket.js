const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Ticket = sequelize.define('Ticket', {
  chat_id: { type: DataTypes.STRING },
  obra: { type: DataTypes.STRING },
  pais: { type: DataTypes.STRING },
  location_lat: { type: DataTypes.STRING },
  location_lng: { type: DataTypes.STRING },
  geo_country: { type: DataTypes.STRING },
  geo_city: { type: DataTypes.STRING },
  store: { type: DataTypes.STRING },
  card_last4: { type: DataTypes.STRING },
  total: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  time: { type: DataTypes.STRING },
  items_json: { type: DataTypes.TEXT }, // guardamos los productos como JSON string
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  

}, {
  timestamps: false,
  tableName: 'tickets'
});

module.exports = Ticket;
