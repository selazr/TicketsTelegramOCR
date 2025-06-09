const { detectCurrencySymbol, extractAmount } = require('../services/exchange');

test('detectCurrencySymbol reconoce USD', () => {
  expect(detectCurrencySymbol('$123')).toBe('USD');
});

test('detectCurrencySymbol reconoce EUR', () => {
  expect(detectCurrencySymbol('Total 20,00 €')).toBe('EUR');
});

test('extractAmount obtiene decimal', () => {
  expect(extractAmount('Total 15,50 EUR')).toBeCloseTo(15.50);
});

test('extractAmount retorna null si no hay numero', () => {
  expect(extractAmount('sin numeros')).toBeNull();
});
