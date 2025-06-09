const axios = require('./httpClient');
const logger = require('./logger');

async function askGPT4oWithImage(base64Image) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un sistema multilingue de extracción de datos de tickets de compra. Devuelve exactamente este JSON:

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

No agregues explicaciones, solo el JSON directamente. Usa "alimentos", "maquinaria" o "otros" como categorías.`
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
    logger.error(`❌ JSON malformado: ${textResponse}`);
    return { error: '❌ Error al convertir la respuesta de GPT-4o.' };
  }
}

module.exports = { askGPT4oWithImage };
