export function prepararCobro({ paymentMethodId, amountCents, currency }) {
  if (typeof paymentMethodId !== 'string' || !/^pm_test_[a-z0-9]+$/.test(paymentMethodId)) {
    throw new TypeError('Se requiere un identificador opaco del proveedor de prueba');
  }
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || currency !== 'COP') {
    throw new TypeError('Importe o moneda inválidos');
  }
  // Un ID de método de pago no autoriza por sí solo una operación.
  return { paymentMethodId, amountCents, currency };
}
