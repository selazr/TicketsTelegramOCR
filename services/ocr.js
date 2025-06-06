const Tesseract = require('tesseract.js');

async function runOCR(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
}

module.exports = { runOCR };
