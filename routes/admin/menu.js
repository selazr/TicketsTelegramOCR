const { getLastTickets } = require('../../services/db');
const { adminIds } = require('../../config/admins');

module.exports = (bot, sessions) => {
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
console.log('🎯 Tickets obtenidos:', JSON.stringify(tickets, null, 2));

        for (const ticket of tickets) {

          const resumen = `🎟️ *Ticket ID:* ${ticket.id}
👤 *Usuario:* ${ticket.user_name || 'N/A'}
📍 *País:* ${ticket.pais || 'N/A'}
🏗️ *Obra:* ${ticket.obra || 'N/A'}
💰 *Total:* ${ticket.total || 'N/A'} (${ticket.currency || 'N/A'})
🕒 *Fecha:* ${new Date(ticket.createdAt).toLocaleString('es-ES')}`;

          await bot.sendMessage(chatId, resumen, { parse_mode: 'Markdown' });
        }

        await bot.answerCallbackQuery({ callback_query_id: query.id });
      } catch (err) {
        console.error('❌ Error al mostrar tickets:', err.message);
        await bot.sendMessage(chatId, '⚠️ Ocurrió un error al obtener los tickets.');
      }
    }
  });
};
