// Módulo 18 · F114 · Carga el .proto en tiempo de ejecución (sin generar código).
// Requisitos: @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1.
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'node:path';

const definicion = protoLoader.loadSync(join(import.meta.dirname, 'inventario.proto'), {
  keepCase: false, // bodega_origen → bodegaOrigen
  longs: String, // int64 como texto (un number de JS pierde precisión por encima de 2^53)
  defaults: true, // los campos sin valor llegan con su valor por defecto (0, "", false)
});

export const { Inventario } = grpc.loadPackageDefinition(definicion).academia.inventario.v1;
export { grpc };
