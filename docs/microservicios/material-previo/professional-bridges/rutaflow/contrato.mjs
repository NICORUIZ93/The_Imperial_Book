export function adaptar(body) {
  if (!body || ![1, 2].includes(body.version)) throw new Error('Versión no soportada');
  if (!Number.isSafeInteger(body.distanciaMetros) || body.distanciaMetros <= 0) {
    throw new Error('distanciaMetros debe ser un entero positivo');
  }
  if (body.version === 2 && body.referencia !== undefined &&
      (typeof body.referencia !== 'string' || body.referencia.length > 80)) {
    throw new Error('Referencia inválida');
  }
  return { distanciaMetros: body.distanciaMetros,
    referencia: body.version === 2 ? (body.referencia ?? '') : '' };
}
