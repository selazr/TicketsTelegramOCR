const axios = require('axios');
const { askGPT4oWithImage } = require('../services/gpt');
const { saveTicketToDB } = require('../services/db');
const {
  convertToEUR,
  detectCurrencySymbol,
  extractAmount
} = require('../services/exchange');

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

      // 🧠 GPT extrae datos del ticket
      const gptData = await askGPT4oWithImage(base64Image);

      // 💱 Detectar currency por país
      const amount = extractAmount(gptData.total);

      const countryToCurrency = {
        'España': 'EUR', 'Francia': 'EUR', 'Alemania': 'EUR', 'Italia': 'EUR',
        'Portugal': 'EUR', 'Bélgica': 'EUR', 'Países Bajos': 'EUR', 'Austria': 'EUR',
        'Irlanda': 'EUR', 'Grecia': 'EUR', 'Estados Unidos': 'USD', 'Canadá': 'CAD',
        'México': 'MXN', 'Argentina': 'ARS', 'Chile': 'CLP', 'Colombia': 'COP',
        'Perú': 'PEN', 'Uruguay': 'UYU', 'Venezuela': 'VES', 'República Dominicana': 'DOP',
        'Ecuador': 'USD', 'El Salvador': 'USD', 'Brasil': 'BRL', 'Paraguay': 'PYG',
        'Bolivia': 'BOB', 'Reino Unido': 'GBP', 'Suiza': 'CHF', 'Suecia': 'SEK',
        'Noruega': 'NOK', 'Dinamarca': 'DKK', 'Polonia': 'PLN', 'Hungría': 'HUF',
        'Chequia': 'CZK', 'Rusia': 'RUB', 'Turquía': 'TRY', 'Marruecos': 'MAD',
        'Egipto': 'EGP', 'Sudáfrica': 'ZAR', 'China': 'CNY', 'Japón': 'JPY',
        'Corea del Sur': 'KRW', 'India': 'INR', 'Vietnam': 'VND', 'Tailandia': 'THB',
        'Australia': 'AUD', 'Nueva Zelanda': 'NZD', 'Emiratos Árabes Unidos': 'AED',
        'Arabia Saudita': 'SAR'
      };

      let currency = countryToCurrency[session.geo_country] || 'EUR';
      let total_eur = null;

      if (currency !== 'EUR' && amount) {
        total_eur = await convertToEUR(amount, currency);
      }

      gptData.currency = currency;
      gptData.total_eur = total_eur;

      session.ticketData = gptData;
      session.step = 'review_ticket';

      // Guardar en base de datos
      console.log('📦 Sesión final antes de guardar ticket:', session);

      const ticketId = await saveTicketToDB({
        chat_id: chatId,
        obra: session.obra,
        user_name: msg.from.first_name || '',
        pais: session.geo_country,
        geo_country: session.geo_country,
        geo_city: session.geo_city,
        location: session.location,
        gpt_data: gptData,
        image_base64: base64Image
      });

      session.ticketId = ticketId;

      // Mostrar resumen
      const { store, card_last4, total, date, time, items } = gptData;

      let totalLine = `💰 *Total:* ${total || 'N/A'} (${currency})`;
      if (total_eur) totalLine += ` (~${total_eur} EUR)`;

      const resumen = `🧾 *Establecimiento:* ${store || 'N/A'}
💳 *Tarjeta:* **** ${card_last4 || 'N/A'}
🕒 *Fecha:* ${date || 'N/A'} - ${time || ''}
${totalLine}

🛒 *Productos:*
${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;

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
              { text: '✏️ Total', callback_data: 'edit_total' },
              { text: '✏️ Moneda', callback_data: 'edit_currency' }
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
