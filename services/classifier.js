const keywords = {
  alimentos: ['pan', 'leche', 'arroz', 'pollo', 'queso'],
  maquinaria: ['taladro', 'bosch', 'martillo', 'amoladora'],
  oficina: ['folio', 'lápiz', 'bolígrafo', 'grapadora']
};

function classifyItems(items) {
  return items.map(item => {
    const name = item.name.toLowerCase();
    const category = Object.entries(keywords).find(([cat, keys]) =>
      keys.some(k => name.includes(k))
    )?.[0] || 'otros';
    return { ...item, category };
  });
}

module.exports = { classifyItems };
