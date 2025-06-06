const Ticket = require('../models/Ticket');

async function saveTicketToDB({ chat_id, obra, pais, gpt_data }) {
  const { store, card_last4, total, date, time, items } = gpt_data;

  const ticket = await Ticket.create({
  chat_id,
  obra,
  pais: geo_country,
  store,
  card_last4,
  total,
  date,
  time,
  items_json: JSON.stringify(items),
  location_lat: session.location?.latitude,
  location_lng: session.location?.longitude,
  geo_country: session.geo_country,
  geo_city: session.geo_city
  });
  return ticket.id; // para guardarlo en la sesión
}

async function updateTicketFinal(ticketId, updatedData) {
  const { store, card_last4, total, date, time, items } = updatedData;

  await Ticket.update({
    store,
    card_last4,
    total,
    date,
    time,
    items_json: JSON.stringify(items)
  }, {
    where: { id: ticketId }
  });
}

module.exports = { saveTicketToDB, updateTicketFinal };
