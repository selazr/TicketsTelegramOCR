function formatTicketData(data) {
  if (data.error) return data.error;

  const { store, card_last4, total, date, time, items } = data;

  return `🧾 Establecimiento: ${store || 'N/A'}
💳 Tarjeta: **** ${card_last4 || 'N/A'}
🕒 Fecha: ${date || 'N/A'} - ${time || 'N/A'}
💰 Total: ${total || 'N/A'}

🛒 Productos:
${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;
}

module.exports = { formatTicketData };
