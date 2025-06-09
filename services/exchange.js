const axios = require('axios');

// 🔁 Convierte una cantidad desde una moneda a euros
async function convertToEUR(amount, fromCurrency) {
  try {
    const res = await axios.get('https://api.exchangerate.host/convert', {
      params: {
        from: fromCurrency,
        to: 'EUR',
        amount
      }
    });

    const converted = res.data.result;
    return converted ? parseFloat(converted.toFixed(2)) : null;
  } catch (err) {
    console.error('❌ Error en conversión de divisa:', err.message);
    return null;
  }
}

// 🧠 Detecta símbolo o abreviatura dentro del total
function detectCurrencySymbol(text) {
  if (/RD\$|DOP/i.test(text)) return 'DOP';
  if (/MXN|\bMEX\b/.test(text)) return 'MXN';
  if (/USD|US\$|U\$D|\$/i.test(text)) return 'USD';
  if (/€|EUR/.test(text)) return 'EUR';
  return 'EUR'; // por defecto si no detecta nada
}

// 🔍 Extrae solo la cantidad numérica del string total
function extractAmount(text) {
  const match = text.match(/(\d+[\.,]\d{2})/);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

module.exports = {
  convertToEUR,
  detectCurrencySymbol,
  extractAmount
};
