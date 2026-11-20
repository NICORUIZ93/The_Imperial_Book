// Módulo 18 · F114 · Cliente gRPC con deadline en cada llamada.
// Requisitos: Node.js 26.13.1 LTS, @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1. Ejecuta: node f114-grpc/cliente.js
import { grpc, Inventario } from './contrato.js';

export function crearCliente(direccion) {
  const stub = new Inventario(direccion, grpc.credentials.createInsecure());
  return {
    // Unaria envuelta en una promesa. El deadline es un instante absoluto: «responde antes de…».
    consultar(sku, { plazoMs = 1000 } = {}) {
      return new Promise((ok, mal) => {
        stub.ConsultarExistencias({ sku }, { deadline: Date.now() + plazoMs }, (error, respuesta) => (error ? mal(error) : ok(respuesta)));
      });
    },
    // Streaming: el stream de lectura es un iterable asíncrono.
    async *seguir(sku, { plazoMs = 5000 } = {}) {
      yield* stub.SeguirExistencias({ sku }, { deadline: Date.now() + plazoMs });
    },
    cerrar: () => stub.close(),
  };
}

if (import.meta.main) {
  const cliente = crearCliente(process.env.INVENTARIO_GRPC ?? '127.0.0.1:50114');
  console.log('unaria   →', await cliente.consultar('TEC-1'));
  for await (const e of cliente.seguir('TEC-1')) console.log('stream   →', e.disponibles);
  for (const [sku, plazoMs] of [['NO-HAY', 1000], ['LENTO', 300]]) {
    await cliente.consultar(sku, { plazoMs }).catch((error) => console.log(`${sku.padEnd(8)} → code=${error.code} (${grpc.status[error.code]}) details="${error.details}"`));
  }
  cliente.cerrar();
}
