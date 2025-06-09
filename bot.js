require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const userSessions = {}; // Se mantiene aquí y se pasa a los módulos

console.log('✅ Bot iniciado y esperando mensajes...');

// Rutas organizadas
require('./routes/admin/menu')(bot);
require('./routes/admin/viewTickets')(bot);

require('./routes/start')(bot, userSessions);
require('./routes/steps')(bot, userSessions);
require('./routes/photoHandler')(bot, userSessions);
require('./routes/editHandler')(bot, userSessions);

// Errores
bot.on('polling_error', (err) => console.error('Polling error:', err.message));
