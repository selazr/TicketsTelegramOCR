const { reverseGeocode } = require('../services/geocode');
const logger = require('../services/logger');

module.exports = (bot, sessions) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const session = sessions[chatId];

    if (!session || session.step === 'start') return;

    if (session.step === 'ask_obra') {
      session.obra = msg.text;
      session.step = 'ask_pais';

      await bot.sendMessage(chatId, '📍 Por favor, comparte tu ubicación actual tocando el botón de abajo.', {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Enviar ubicación', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

    sessions[chatId] = session; // Asegura que se guarde incluso si solo pasó por ask_obra
  });

  bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const session = sessions[chatId];
    if (!session || session.step !== 'ask_pais') return;

    const { latitude, longitude } = msg.location;
    session.location = { latitude, longitude };

    const geo = await reverseGeocode(latitude, longitude);
    session.geo_country = geo.country;
    session.geo_city = geo.city;
    session.geo_text = geo.formatted;

    logger.info(`📍 Ubicación recibida de ${msg.from.first_name || 'usuario'}: ${latitude}, ${longitude}`);
    logger.info(`🌍 Localización detectada: ${geo.formatted}`);

    session.step = 'ask_ticket';

    await bot.sendMessage(chatId, `📍 Ubicación detectada: *${geo.formatted || 'desconocida'}*`, {
      parse_mode: 'Markdown',
      reply_markup: { remove_keyboard: true }
    });

    await bot.sendMessage(chatId, '📷 Ahora por favor, sube una foto del ticket que se vea claramente.');

    sessions[chatId] = session;
  });
};
