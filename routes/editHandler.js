const { convertToEUR, extractAmount } = require('../services/exchange');
const { updateTicketFinal } = require('../services/db');

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
      edit_total: 'editing_total',
      edit_currency: 'editing_currency'
    };

    if (editableFields[data]) {
      session.step = editableFields[data];
      await bot.sendMessage(chatId, `✏️ Escribe el nuevo valor para: ${data.replace('edit_', '')}`);
      await bot.answerCallbackQuery({ callback_query_id: query.id });
      return;
    }

    // Confirmar ticket como correcto
    if (data === 'confirm_ticket') {
      const { ticketId, ticketData } = session;
      const { store, card_last4, total, date, time, items, currency, total_eur } = ticketData;

      await updateTicketFinal(ticketId, {
        store,
        card_last4,
        total,
        date,
        time,
        items,
        currency,
        total_eur
      });

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
      case 'editing_currency':
        session.ticketData.currency = value.toUpperCase().trim();
        const amount = extractAmount(session.ticketData.total);
        session.ticketData.total_eur = amount
          ? await convertToEUR(amount, session.ticketData.currency)
          : null;
        break;
      default:
        return; // Si no estaba editando nada, no hacer nada
    }

    session.step = 'review_ticket';

    const { store, card_last4, total, date, time, items, currency, total_eur } = session.ticketData;

    let totalLine = `💰 *Total:* ${total || 'N/A'} (${currency || 'EUR'})`;
    if (total_eur) totalLine += ` (~${total_eur} EUR)`;

    const resumen = `🧾 *Establecimiento:* ${store || 'N/A'}
💳 *Tarjeta:* **** ${card_last4 || 'N/A'}
🕒 *Fecha:* ${date || 'N/A'} - ${time || ''}
${totalLine}

🛒 *Productos:*
${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;

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
            { text: '✏️ Total', callback_data: 'edit_total' },
            { text: '✏️ Moneda', callback_data: 'edit_currency' }
          ],
          [
            { text: '✅ Todo correcto / Continuar', callback_data: 'confirm_ticket' }
          ]
        ]
      }
    });
  });
};
