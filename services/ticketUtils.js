function getDestination(itemsJson) {
  try {
    const items = JSON.parse(itemsJson || '[]');
    const counts = items.reduce((acc, item) => {
      const cat = item.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const categories = Object.keys(counts);
    if (!categories.length) return 'N/A';
    return categories.reduce((a, b) => counts[a] >= counts[b] ? a : b);
  } catch {
    return 'N/A';
  }
}

module.exports = { getDestination };
