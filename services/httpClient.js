const axios = require('axios');
const axiosRetry = require('axios-retry');

const retry = axiosRetry.default || axiosRetry;
retry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

module.exports = axios;
