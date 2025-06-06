function extractData(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const store = lines[0]; // suposición
  const cardMatch = text.match(/\*\*\*\*\s*\d{4}/);
  const totalMatch = text.match(/(\d+[\.,]\d{2})\s*(€|EUR|EUROS)?/i);
  const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}.*\d{2}:\d{2}/);

  const items = lines.slice(1, -3).map(l => ({ name: l }));

  return {
    store,
    card: cardMatch?.[0],
    total: totalMatch?.[1],
    date: dateMatch?.[0],
    items
  };
}

module.exports = { extractData };
