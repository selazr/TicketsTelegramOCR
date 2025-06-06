require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { handleTicketPhoto } = require('./services/fileHandler');

// Inicializar bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Mensaje de inicio en consola
console.log('🤖 Bot iniciado correctamente y escuchando mensajes...');

// Manejo de errores globales
bot.on('polling_error', (err) => {
  console.error('❌ Error de polling:', err.message);
});

bot.on('webhook_error', (err) => {
  console.error('❌ Error de webhook:', err.message);
});

// Respuesta a imágenes
bot.on('photo', async (msg) => {
  try {
    await handleTicketPhoto(bot, msg);
  } catch (err) {
    console.error('❌ Error al procesar la foto:', err);
    await bot.sendMessage(msg.chat.id, '⚠️ Ha ocurrido un error procesando la imagen. Intenta de nuevo.');
  }
});

// (Opcional) Mensaje si alguien escribe /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `¡Hola ${msg.from.first_name || '👤'}! Envíame una foto de un ticket y te diré el total, la fecha y los productos 😄`);
});
