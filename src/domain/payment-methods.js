export const NICEPAY_PAYMENT_METHODS = Object.freeze([
  Object.freeze({ id: 'card', label: '신용·체크카드' }),
  Object.freeze({ id: 'naverpayCard', label: '네이버페이(카드)' }),
  Object.freeze({ id: 'kakaopay', label: '카카오페이' }),
]);

export function nicepayMethods(value = 'card') {
  const requested = typeof value === 'string' ? value.split(',').map(s => s.trim().toLowerCase()) : [];
  const methods = requested.map(id => NICEPAY_PAYMENT_METHODS.find(m => m.id.toLowerCase() === id)?.id);
  return methods.length && methods.every(Boolean) ? [...new Set(methods)] : [];
}
