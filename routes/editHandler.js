module.exports = (bot, sessions) => {
  // Botón de editar
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const session = sessions[chatId];

    if (!session || !session.ticketData) return;

    const data = query.data;

    // Cambiar a paso de edición según campo
    const editableFields = {
      edit_store: 'editing_store',
      edit_card: 'editing_card',
      edit_date: 'editing_date',
      edit_total: 'editing_total'
    };

    if (editableFields[data]) {
      session.step = editableFields[data];
      await bot.sendMessage(chatId, `✏️ Escribe el nuevo valor para: ${data.replace('edit_', '')}`);
      await bot.answerCallbackQuery({ callback_query_id: query.id });
      return;
    }

    // Confirmar ticket como correcto
    if (data === 'confirm_ticket') {
      await bot.sendMessage(chatId, '✅ Ticket guardado correctamente. ¡Gracias!');
      delete sessions[chatId];
      await bot.answerCallbackQuery({ callback_query_id: query.id });
    }
  });

  // Procesar el texto del usuario como nuevo valor del campo en edición
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const session = sessions[chatId];
    if (!session || !session.ticketData) return;

    const value = msg.text;

    switch (session.step) {
      case 'editing_store':
        session.ticketData.store = value;
        break;
      case 'editing_card':
        session.ticketData.card_last4 = value.replace(/[^0-9]/g, '').slice(-4);
        break;
      case 'editing_date':
        session.ticketData.date = value;
        break;
      case 'editing_total':
        session.ticketData.total = value;
        break;
      default:
        return; // Si no estaba editando nada, no hacer nada
    }

    session.step = 'review_ticket';

    const { store, card_last4, total, date, time, items } = session.ticketData;

    const resumen = `🧾 *Establecimiento:* ${store || 'N/A'}\n💳 *Tarjeta:* **** ${card_last4 || 'N/A'}\n🕒 *Fecha:* ${date || 'N/A'} - ${time || ''}\n💰 *Total:* ${total || 'N/A'}\n\n🛒 *Productos:*\n${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;

    await bot.sendMessage(chatId, `📄 Datos actualizados:\n\n${resumen}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✏️ Establecimiento', callback_data: 'edit_store' },
            { text: '✏️ Tarjeta', callback_data: 'edit_card' }
          ],
          [
            { text: '✏️ Fecha', callback_data: 'edit_date' },
            { text: '✏️ Total', callback_data: 'edit_total' }
          ],
          [
            { text: '✅ Todo correcto / Continuar', callback_data: 'confirm_ticket' }
          ]
        ]
      }
    });
  });
};
