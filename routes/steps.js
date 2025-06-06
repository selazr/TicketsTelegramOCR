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
    } else if (session.step === 'ask_pais') {
      session.pais = msg.text;
      session.step = 'ask_ticket';
      await bot.sendMessage(chatId, '📷 Por favor, sube una foto del ticket.\n\n⚠️ Asegúrate de que se vea **CLARAMENTE**.');
    }

    sessions[chatId] = session;
  });
    bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const session = sessions[chatId];

    if (!session || session.step !== 'ask_pais') return;

    const { latitude, longitude } = msg.location;
    session.location = { latitude, longitude };
    session.step = 'ask_ticket';

    await bot.sendMessage(chatId, '📷 Perfecto. Ahora por favor, sube una foto del ticket que se vea claramente.', {
      reply_markup: { remove_keyboard: true }
    });
  });

};
