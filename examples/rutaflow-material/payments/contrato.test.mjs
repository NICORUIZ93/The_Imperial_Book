import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararCobro } from './contrato.mjs';
test('solo acepta un identificador de prueba, sin datos de tarjeta', () => {
  const body = prepararCobro({ paymentMethodId: 'pm_test_abc', amountCents: 10000, currency: 'COP' });
  assert.deepEqual(Object.keys(body).sort(), ['amountCents', 'currency', 'paymentMethodId']);
  assert.throws(() => prepararCobro({ paymentMethodId: 'numero-de-tarjeta', amountCents: 10000, currency: 'COP' }));
});
test('no transforma silenciosamente el importe', () => {
  assert.throws(() => prepararCobro({ paymentMethodId: 'pm_test_abc', amountCents: 10.5, currency: 'COP' }));
});
