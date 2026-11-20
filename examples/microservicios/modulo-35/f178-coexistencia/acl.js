// Módulo 31 · F178 · Capa anticorrupción (ACL): traduce el modelo del monolito al del servicio nuevo.
// El servicio nuevo nunca ve «EST='F'» ni importes como texto con coma: si el legado cambia, solo cambia este archivo.
const ESTADOS = { P: 'PENDIENTE', F: 'FACTURADO', A: 'ANULADO' };

export function traducir(cambio) {
  const estado = ESTADOS[cambio.est];
  if (!estado) throw new Error(`estado de legado desconocido: ${cambio.est}`);
  // '1234,50' (texto con coma decimal) -> 123450 céntimos (entero: nunca dinero en coma flotante).
  const [enteros, decimales = '0'] = cambio.importe.split(',');
  return { id: cambio.num_ped, clienteId: cambio.cod_cli, estado, totalCentimos: Number(enteros) * 100 + Number(decimales.padEnd(2, '0').slice(0, 2)) };
}
