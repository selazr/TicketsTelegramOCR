const Ticket = require('../models/Ticket');

/**
 * Guarda un nuevo ticket en la base de datos SQL
 */
async function saveTicketToDB({
  chat_id,
  obra,
  user_name,
  pais,
  geo_country,
  geo_city,
  location,
  gpt_data,
  image_base64
}) {
  const { store, card_last4, total, date, time, items, currency, total_eur } = gpt_data;

  const ticket = await Ticket.create({
    chat_id,
    obra,
    user_name,
    pais,
    store,
    card_last4,
    total,
    date,
    time,
    currency,
    total_eur,
    items_json: JSON.stringify(items),
    image: image_base64,
    location_lat: location?.latitude || null,
    location_lng: location?.longitude || null,
    geo_country,
    geo_city
  });

  return ticket.id;
}

/**
 * Actualiza un ticket existente con datos corregidos por el usuario
 */
async function updateTicketFinal(ticketId, updatedData) {
  const { store, card_last4, total, date, time, items, currency, total_eur } = updatedData;

  await Ticket.update({
    store,
    card_last4,
    total,
    date,
    time,
    currency,
    total_eur,
    items_json: JSON.stringify(items)
  }, {
    where: { id: ticketId }
  });
}

/**
 * Devuelve los últimos N tickets (por defecto 10)
 */
async function getLastTickets(limit = 10) {
  return await Ticket.findAll({
    order: [['createdAt', 'DESC']],
    limit
  });
}

async function getTicketById(id) {
  return await Ticket.findByPk(id);
}

async function deleteTicketById(id) {
  return await Ticket.destroy({ where: { id } });
}

async function getStats() {
  const totalTickets = await Ticket.count();
  return { totalTickets };
}

module.exports = {
  saveTicketToDB,
  updateTicketFinal,
  getLastTickets,
  getTicketById,
  deleteTicketById,
  getStats
};
