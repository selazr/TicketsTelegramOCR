const { adminIds } = require('../config/admins');

// Envía una notificación a todos los administradores con opción a ver el ticket
function notifyAdmins(bot, ticket) {
  if (!ticket) return;
  for (const id of adminIds) {
    bot.sendMessage(id, `📩 Nuevo ticket recibido de *${ticket.user_name || 'usuario'}*.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Ver Ticket', callback_data: `admin_view_ticket_${ticket.id}` }]
        ]
      }
    });
  }
}

module.exports = { notifyAdmins };
