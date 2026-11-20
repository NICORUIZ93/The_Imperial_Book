// Módulo 22 · F141 · CQRS, lado de LECTURA (consultas): un modelo desnormalizado, pensado para las pantallas,
// que se actualiza escuchando eventos. Nunca valida reglas ni escribe en el modelo de escritura.
import { Injectable } from '@nestjs/common';
import { EventsHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { IEventHandler, IQueryHandler } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { ProductoCreado, PrecioCambiado } from './escritura.js';

export interface FichaProducto { id: string; nombre: string; precio: number; precioAnterior: number | null; cambios: number; version: number }

@Injectable()
export class CatalogoLectura {
  readonly fichas = new Map<string, FichaProducto>();
  retrasoMs = 30; // simula la propagación asíncrona (cola, otra réplica, otra base de datos)
}

@EventsHandler(ProductoCreado, PrecioCambiado)
export class ProyeccionCatalogo implements IEventHandler<ProductoCreado | PrecioCambiado> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async handle(e: ProductoCreado | PrecioCambiado) {
    await esperar(this.catalogo.retrasoMs);
    const ficha = this.catalogo.fichas.get(e.id);
    if (ficha && ficha.version >= e.version) return; // idempotente: un evento repetido o viejo no cambia nada
    if (e instanceof ProductoCreado) {
      this.catalogo.fichas.set(e.id, { id: e.id, nombre: e.nombre, precio: e.precio, precioAnterior: null, cambios: 0, version: e.version });
    } else if (ficha) {
      this.catalogo.fichas.set(e.id, { ...ficha, precio: e.precio, precioAnterior: e.anterior, cambios: ficha.cambios + 1, version: e.version });
    }
  }
}

export class ListarCatalogo extends Query<FichaProducto[]> { constructor(readonly precioMaximo = Infinity) { super(); } }
// versionMinima: «léeme al menos lo que yo acabo de escribir» (read-your-writes). Espera hasta 1 s.
export class VerProducto extends Query<FichaProducto | null> { constructor(readonly id: string, readonly versionMinima = 0) { super(); } }

@QueryHandler(ListarCatalogo)
export class ListarCatalogoHandler implements IQueryHandler<ListarCatalogo> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async execute({ precioMaximo }: ListarCatalogo) {
    return [...this.catalogo.fichas.values()].filter((f) => f.precio <= precioMaximo).sort((a, b) => a.precio - b.precio);
  }
}

@QueryHandler(VerProducto)
export class VerProductoHandler implements IQueryHandler<VerProducto> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async execute({ id, versionMinima }: VerProducto) {
    const limite = Date.now() + 1000;
    while ((this.catalogo.fichas.get(id)?.version ?? 0) < versionMinima && Date.now() < limite) await esperar(5);
    return this.catalogo.fichas.get(id) ?? null;
  }
}
