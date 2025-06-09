const fs = require('fs');
const axios = require('./httpClient');
const sharp = require('sharp');
const { askGPT4oWithImage } = require('./gpt');
const { formatTicketData } = require('./formatter');
const logger = require('./logger');

async function handleTicketPhoto(bot, msg) {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];
  const file = await bot.getFile(photo.file_id);
  const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
  const filePath = `uploads/${Date.now()}.jpg`;

  try {
    const writer = fs.createWriteStream(filePath);
    const res = await axios({ url, responseType: 'stream' });
    res.data.pipe(writer);

    writer.on('finish', async () => {
      const imageBuffer = await sharp(filePath).resize({ width: 1024 }).toBuffer();
      const base64Image = imageBuffer.toString('base64');

      const gptResponse = await askGPT4oWithImage(base64Image);
      const message = formatTicketData(gptResponse);

      await bot.sendMessage(chatId, message);
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    logger.error(`❌ Error GPT: ${error.message}`);
    await bot.sendMessage(chatId, '❌ Error al procesar con GPT-4o.');
  }
}

module.exports = { handleTicketPhoto };
