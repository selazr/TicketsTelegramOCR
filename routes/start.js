const { adminIds } = require('../config/admins');

module.exports = (bot, sessions) => {
  const sendStartMessage = (chatId) => {
    sessions[chatId] = { step: 'start' };

    const greeting = adminIds.includes(chatId)
      ? '👋 ¡Hola administrador! Usa /admin para acceder al panel.\n¿Deseas subir un ticket ahora?'
      : '👋 ¡Hola! Bienvenido al bot de tickets. Puedes registrar tus compras aquí.\n¿Deseas subir un ticket?';

    bot.sendMessage(chatId, greeting, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Sí', callback_data: 'start_yes' },
            { text: '❌ No', callback_data: 'start_no' }
          ]
        ]
      }
    });
  };

  // Comando /start
  bot.onText(/\/start/, (msg) => {
    sendStartMessage(msg.chat.id);
  });

  // También cualquier saludo
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase();
    const session = sessions[chatId];

    // Si ya hay una sesión con paso activo, no reiniciamos
    if (session?.step && session.step !== 'start') return;

    const saludos = ['hola', 'buenas', 'buenos días', 'buenas tardes', 'ey', 'hello', 'hi', 'qué tal'];

    if (saludos.some(s => text.includes(s))) {
      sendStartMessage(chatId);
    }
  });

  // Manejo de botones “Sí / No”
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const session = sessions[chatId] || {};

    switch (query.data) {
      case 'start_yes':
        session.step = 'ask_obra';
        await bot.sendMessage(chatId, '🏗️ ¿En qué obra estás?');
        break;
      case 'start_no':
        await bot.sendMessage(chatId, '👋 Entendido, hasta pronto.');
        delete sessions[chatId];
        break;
    }

    sessions[chatId] = session;
    await bot.answerCallbackQuery({ callback_query_id: query.id });
  });
};
