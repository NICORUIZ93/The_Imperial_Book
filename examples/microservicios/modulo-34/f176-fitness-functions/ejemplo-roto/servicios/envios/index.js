// envios también lee la tarifa interna, pero con import() dinámico (más difícil de ver).
export async function costoEnvio(valor) {
  const { comision } = await import('../pagos/interno/tarifas.js');
  return 12000 + comision(valor);
}
