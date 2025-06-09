const Ticket = require('../models/Ticket');

/**
 * Guarda un nuevo ticket en la base de datos SQL
 */
async function saveTicketToDB({
  chat_id,
  obra,
  user_name,
  pais, // texto libre, puede ser redundante con geo_country
  geo_country,
  geo_city,
  location,
  gpt_data
}) {
  const { store, card_last4, total, date, time, items } = gpt_data;

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
    items_json: JSON.stringify(items),
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


module.exports = {
  saveTicketToDB,
  updateTicketFinal
};
