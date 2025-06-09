const axios = require('axios');

async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        key: process.env.OPENCAGE_API_KEY,
        q: `${lat},${lng}`,
        language: 'es',
        pretty: 1
      }
    });

    const result = response.data.results?.[0];
    if (!result) return { country: null, city: null, formatted: null };

    const components = result.components;
    return {
      country: components.country || null,
      city: components.city || components.town || components.village || null,
      formatted: result.formatted || null
    };
  } catch (err) {
    console.error('❌ Error en reverseGeocode:', err.message);
    return {
      country: null,
      city: null,
      formatted: null
    };
  }
}

module.exports = { reverseGeocode };
