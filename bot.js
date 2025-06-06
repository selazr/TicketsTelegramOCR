require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const sharp = require('sharp');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];
  const file = await bot.getFile(photo.file_id);
  const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
  const filePath = `uploads/${Date.now()}.jpg`;

  const writer = fs.createWriteStream(filePath);
  const res = await axios({ url, responseType: 'stream' });
  res.data.pipe(writer);

  writer.on('finish', async () => {
    const imageBuffer = await sharp(filePath).resize({ width: 1024 }).toBuffer();
    const base64Image = imageBuffer.toString('base64');

    const gptResponse = await askGPT4oWithImage(base64Image);
    await bot.sendMessage(chatId, formatTicketData(gptResponse));
    fs.unlinkSync(filePath);
  });
});

// GPT-4o con visión
async function askGPT4oWithImage(base64Image) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un sistema multilingue de extracción de datos de tickets de compra. A partir de una imagen, debes devolver exactamente este JSON:

{
  "store": "",
  "card_last4": "",
  "total": "",
  "date": "",
  "time": "",
  "items": [
    { "name": "", "category": "" }
  ]
}

No agregues explicaciones, solo el JSON directamente. Usa "alimentos", "maquinaria" o "otros" como categorías posibles.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const textResponse = response.data.choices[0].message.content;

  try {
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}');
    const jsonString = textResponse.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Error al parsear:', textResponse);
    return { error: '❌ Error al convertir la respuesta de GPT-4o. Revisa la consola.' };
  }
}

// Formatea los datos
function formatTicketData(data) {
  if (data.error) return data.error;

  const { store, card_last4, total, date, time, items } = data;

  return `🧾 Establecimiento: ${store || 'N/A'}
💳 Tarjeta: **** ${card_last4 || 'N/A'}
🕒 Fecha: ${date || 'N/A'} - ${time || 'N/A'}
💰 Total: ${total || 'N/A'}

🛒 Productos:
${(items || []).map(i => `- ${i.name} → ${i.category}`).join('\n')}`;
}
