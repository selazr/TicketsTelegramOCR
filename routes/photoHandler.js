const axios = require('axios');
const { askGPT4oWithImage } = require('../services/gpt');
const { saveTicketToDB } = require('../services/db');

module.exports = (bot, sessions) => {
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const session = sessions[chatId];
    if (!session || session.step !== 'ask_ticket') return;

    try {
      const photo = msg.photo[msg.photo.length - 1];
      const file = await bot.getFile(photo.file_id);
      const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const res = await axios({ url, responseType: 'arraybuffer' });
      const base64Image = Buffer.from(res.data).toString('base64');

      const gptData = await askGPT4oWithImage(base64Image);

      session.ticketData = gptData;
      session.step = 'review_ticket';

      await saveTicketToDB({
        chat_id: chatId,
        obra: session.obra,
        pais: session.pais,
        gpt_data: gptData,    
      });

      const { store, card_last4, total, date, time, items } = gptData;

      const resumen = `🧾 *Establecimiento:* ${store || 'N/A'}\n💳 *Tarjeta:* **** ${card_last4 || 'N/A'}\n🕒 *Fecha:* ${date || 'N/A'} - ${time || ''}\n💰 *Total:* ${total || 'N/A'}\n\n🛒 *Productos:*\n${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;

      await bot.sendMessage(chatId, `🔍 Datos detectados:\n\n${resumen}`, {
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

    } catch (err) {
      console.error('❌ Error con la imagen:', err.message);
      bot.sendMessage(chatId, '❌ Error al procesar el ticket. Intenta con una imagen clara.');
    }
  });
};
