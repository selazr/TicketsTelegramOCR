const {
  getLastTickets,
  getTicketById,
  deleteTicketById,
  getStats
} = require('../../services/db');
const { adminIds } = require('../../config/admins');
const logger = require('../../services/logger');

module.exports = (bot) => {
  const adminSessions = {};
  // Comando para abrir el panel de administrador
  bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;

    if (!adminIds.includes(chatId)) {
      return bot.sendMessage(chatId, '⛔ No tienes permisos para acceder al panel de administrador.');
    }

    await bot.sendMessage(chatId, '⚙️ *Panel de Administrador*', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Ver últimos tickets', callback_data: 'admin_last_tickets' }],
          [{ text: '🔍 Buscar ticket por ID', callback_data: 'admin_search_ticket' }],
          [{ text: '📊 Ver estadísticas', callback_data: 'admin_stats' }],
          [{ text: '🗑️ Borrar ticket', callback_data: 'admin_delete_ticket' }]
        ]
      }
    });
  });

  // Manejo de botones del menú de admin
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'admin_last_tickets') {
      try {
        const tickets = await getLastTickets(10);

        if (!tickets.length) {
          return bot.sendMessage(chatId, '📭 No hay tickets registrados aún.');
        }

        for (const ticket of tickets) {
          const resumen = `🎟️ *Ticket ID:* ${ticket.id}
👤 *Usuario:* ${ticket.user_name || 'N/A'}
📍 *País:* ${ticket.pais || 'N/A'}
🏗️ *Obra:* ${ticket.obra || 'N/A'}
💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})` +
            (ticket.total_eur ? ` (~${ticket.total_eur} EUR)` : '') + `
🕒 *Fecha:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;

          if (ticket.image) {
            await bot.sendPhoto(chatId, Buffer.from(ticket.image, 'base64'), {
              caption: resumen,
              parse_mode: 'Markdown'
            });
          } else {
            await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
          }
        }

        await bot.answerCallbackQuery({ callback_query_id: query.id });
      } catch (err) {
        logger.error(`❌ Error al mostrar tickets: ${err.message}`);
        await bot.sendMessage(chatId, '⚠️ Ocurrió un error al obtener los tickets.');
      }
    }

    if (data === 'admin_search_ticket') {
      adminSessions[chatId] = { action: 'search' };
      await bot.sendMessage(chatId, '🆔 Envía el ID del ticket a buscar:');
      await bot.answerCallbackQuery({ callback_query_id: query.id });
    }

    if (data === 'admin_delete_ticket') {
      adminSessions[chatId] = { action: 'delete' };
      await bot.sendMessage(chatId, '🗑️ Envía el ID del ticket a borrar:');
      await bot.answerCallbackQuery({ callback_query_id: query.id });
    }

    if (data === 'admin_stats') {
      const stats = await getStats();
      let msgStats = `📊 Tickets registrados: ${stats.totalTickets}`;
      if (stats.totalEUR !== undefined) {
        msgStats += `\n💶 Gasto total aproximado: ${stats.totalEUR} EUR`;
      }
      await bot.sendMessage(chatId, msgStats);
      await bot.answerCallbackQuery({ callback_query_id: query.id });
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const session = adminSessions[chatId];
    if (!session) return;

    if (session.action === 'search') {
      const id = parseInt(msg.text);
      const ticket = await getTicketById(id);
      if (!ticket) {
        await bot.sendMessage(chatId, '❌ Ticket no encontrado.');
      } else {
        const resumen = `🎟️ *Ticket ID:* ${ticket.id}
👤 *Usuario:* ${ticket.user_name || 'N/A'}
📍 *País:* ${ticket.pais || 'N/A'}
🏗️ *Obra:* ${ticket.obra || 'N/A'}
💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})` +
          (ticket.total_eur ? ` (~${ticket.total_eur} EUR)` : '') + `
🕒 *Fecha:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;

        if (ticket.image) {
          await bot.sendPhoto(chatId, Buffer.from(ticket.image, 'base64'), {
            caption: resumen,
            parse_mode: 'Markdown'
          });
        } else {
          await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
        }
      }
      delete adminSessions[chatId];
    } else if (session.action === 'delete') {
      const id = parseInt(msg.text);
      const deleted = await deleteTicketById(id);
      if (deleted) {
        await bot.sendMessage(chatId, '🗑️ Ticket borrado correctamente.');
      } else {
        await bot.sendMessage(chatId, '❌ No se encontró el ticket.');
      }
      delete adminSessions[chatId];
    }
  });
};
