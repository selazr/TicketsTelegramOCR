const { getLastTickets, getTicketById } = require('../../services/db');
const logger = require('../../services/logger');

module.exports = (bot) => {
  bot.onText(/^\/admin_tickets$/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const tickets = await getLastTickets(5); // Número configurable

      if (tickets.length === 0) {
        await bot.sendMessage(chatId, '❌ No se encontraron tickets recientes.');
        return;
      }

      for (const ticket of tickets) {
        const resumen = `🎟️ *Ticket ID:* ${ticket.id}
👤 *Usuario:* ${ticket.user_name || 'N/A'}
📍 *País:* ${ticket.pais || 'N/A'}
🏗️ *Obra:* ${ticket.obra || 'N/A'}
💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})` +
          (ticket.total_eur ? ` (~${ticket.total_eur} EUR)` : '') + `
🕒 *Fecha:* ${ticket.date || 'N/A'} - ${ticket.time || ''}
📅 *Creado:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;

        if (ticket.image) {
          await bot.sendPhoto(chatId, Buffer.from(ticket.image, 'base64'), {
            caption: resumen,
            parse_mode: 'Markdown'
          });
        } else {
          await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
        }
      }
    } catch (err) {
      logger.error(`❌ Error mostrando tickets: ${err.message}`);
      await bot.sendMessage(chatId, '⚠️ Error al recuperar los tickets.');
    }
  });

  // Mostrar un ticket específico cuando llega la notificación
  bot.on('callback_query', async (query) => {
    const data = query.data;
    if (!data.startsWith('admin_view_ticket_')) return;

    const chatId = query.message.chat.id;
    const id = parseInt(data.split('_').pop());
    const ticket = await getTicketById(id);

    if (!ticket) {
      await bot.sendMessage(chatId, '❌ Ticket no encontrado.');
      return bot.answerCallbackQuery({ callback_query_id: query.id });
    }

    const resumen = `🎟️ *Ticket ID:* ${ticket.id}\n` +
      `👤 *Usuario:* ${ticket.user_name || 'N/A'}\n` +
      `📍 *País:* ${ticket.pais || 'N/A'}\n` +
      `🏗️ *Obra:* ${ticket.obra || 'N/A'}\n` +
      `💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})` +
      (ticket.total_eur ? ` (~${ticket.total_eur} EUR)` : '') + '\n' +
      `🕒 *Fecha:* ${ticket.date || 'N/A'} - ${ticket.time || ''}` + '\n' +
      `📅 *Creado:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;

    if (ticket.image) {
      await bot.sendPhoto(chatId, Buffer.from(ticket.image, 'base64'), {
        caption: resumen,
        parse_mode: 'Markdown'
      });
    } else {
      await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
    }

    await bot.answerCallbackQuery({ callback_query_id: query.id });
  });
};
