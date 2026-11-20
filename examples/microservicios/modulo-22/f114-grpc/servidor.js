// Módulo 18 · F114 · Servidor gRPC del servicio «inventario».
// Requisitos: Node.js 26.13.1 LTS, @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1. Ejecuta: node f114-grpc/servidor.js
import { setTimeout as dormir } from 'node:timers/promises';
import { grpc, Inventario } from './contrato.js';

const EXISTENCIAS = { 'TEC-1': 12, 'MOU-2': 0 };

const implementacion = {
  // Unaria: (call, callback). call.request trae el mensaje ya convertido a objeto.
  async ConsultarExistencias(call, callback) {
    const { sku } = call.request;
    if (sku === 'LENTO') await dormir(1500);
    if (!(sku in EXISTENCIAS) && sku !== 'LENTO') {
      // Los errores viajan como un CÓDIGO de estado gRPC + detalle (no hay 404: hay NOT_FOUND).
      return callback({ code: grpc.status.NOT_FOUND, details: `No existe el SKU ${sku}` });
    }
    callback(null, { sku, disponibles: EXISTENCIAS[sku] ?? 1, bodegaOrigen: 'BOG-1' });
  },

  // Streaming de servidor: se escribe varias veces en call y se cierra con call.end().
  async SeguirExistencias(call) {
    const { sku } = call.request;
    let disponibles = EXISTENCIAS[sku] ?? 0;
    for (let i = 0; i < 3 && !call.cancelled; i++) {
      call.write({ sku, disponibles, bodegaOrigen: 'BOG-1' });
      disponibles -= 1; // simula ventas
      await dormir(100);
    }
    call.end();
  },
};

export async function iniciarServidor(puerto = 0) {
  const servidor = new grpc.Server();
  servidor.addService(Inventario.service, implementacion);
  // createInsecure(): sin TLS, solo para desarrollo local. En producción: createSsl() o mTLS de la malla.
  const puertoReal = await new Promise((ok, mal) =>
    servidor.bindAsync(`127.0.0.1:${puerto}`, grpc.ServerCredentials.createInsecure(), (error, p) => (error ? mal(error) : ok(p))),
  );
  return { puerto: puertoReal, detener: () => new Promise((ok) => servidor.tryShutdown(ok)) };
}

if (import.meta.main) {
  const { puerto } = await iniciarServidor(Number(process.env.PORT ?? 50114));
  console.log(`inventario gRPC escuchando en 127.0.0.1:${puerto}`);
}
