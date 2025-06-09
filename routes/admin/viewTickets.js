const { getLatestTickets } = require('../../services/db');

module.exports = (bot) => {
  bot.onText(/^\/admin_tickets$/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const tickets = await getLatestTickets(5); // Número configurable

      if (tickets.length === 0) {
        await bot.sendMessage(chatId, '❌ No se encontraron tickets recientes.');
        return;
      }

      for (const ticket of tickets) {
        const resumen = `🎟️ *Ticket ID:* ${ticket.id}
👤 *Usuario:* ${ticket.user_name || 'N/A'}
📍 *País:* ${ticket.pais || 'N/A'}
🏗️ *Obra:* ${ticket.obra || 'N/A'}
💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})
🕒 *Fecha:* ${ticket.date || 'N/A'} - ${ticket.time || ''}
📅 *Creado:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;


        await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
      }
    } catch (err) {
      console.error('❌ Error mostrando tickets:', err.message);
      await bot.sendMessage(chatId, '⚠️ Error al recuperar los tickets.');
    }
  });
};
