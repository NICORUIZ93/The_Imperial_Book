// Módulo 18 · F115 · Los «servicios» que hay detrás del grafo. En un sistema real serían llamadas REST o gRPC
// a pedidos y a clientes; aquí son funciones en memoria que CUENTAN cuántas veces las llaman.
const PEDIDOS = [
  { id: 'P-1', clienteId: 'C-1', total: 240000 },
  { id: 'P-2', clienteId: 'C-2', total: 50000 },
  { id: 'P-3', clienteId: 'C-1', total: 99000 },
];
const CLIENTES = { 'C-1': { id: 'C-1', nombre: 'Ana', email: 'ana@correo.co' }, 'C-2': { id: 'C-2', nombre: 'Luis', email: 'luis@correo.co' } };

export function crearServicios() {
  const llamadas = { pedidos: 0, clientes: 0 };
  return {
    llamadas,
    pedidos: {
      async listar() { llamadas.pedidos += 1; return PEDIDOS; },
      async buscar(id) { llamadas.pedidos += 1; return PEDIDOS.find((p) => p.id === id) ?? null; },
      async crear(clienteId, total) {
        llamadas.pedidos += 1;
        const pedido = { id: `P-${PEDIDOS.length + 1}`, clienteId, total };
        return pedido; // no se guarda: los tests siguen siendo repetibles
      },
    },
    clientes: {
      async buscar(id) { llamadas.clientes += 1; return CLIENTES[id] ?? null; }, // 1 llamada por cliente
      async buscarVarios(ids) { llamadas.clientes += 1; return ids.map((id) => CLIENTES[id] ?? null); }, // 1 llamada por lote
    },
  };
}
