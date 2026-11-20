// Módulo 22 · F141 · CQRS, lado de ESCRITURA (comandos): valida reglas, guarda eventos y los publica.
// Nunca responde consultas: un comando devuelve, como mucho, la versión nueva.
// Requisitos: Node.js 26.13.1 LTS, @nestjs/cqrs 12.1.3, TypeScript 6.0.3.
import { Injectable } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import type { ICommandHandler, IEvent } from '@nestjs/cqrs';

export class CrearProducto extends Command<number> { constructor(readonly id: string, readonly nombre: string, readonly precio: number) { super(); } }
export class CambiarPrecio extends Command<number> { constructor(readonly id: string, readonly precio: number) { super(); } }

export class ProductoCreado implements IEvent { constructor(readonly id: string, readonly version: number, readonly nombre: string, readonly precio: number) {} }
export class PrecioCambiado implements IEvent { constructor(readonly id: string, readonly version: number, readonly anterior: number, readonly precio: number) {} }
type EventoProducto = ProductoCreado | PrecioCambiado;

export class ReglaDeNegocio extends Error { name = 'ReglaDeNegocio'; }

// Modelo de escritura: solo lo necesario para DECIDIR (¿existe?, precio actual). Nada de listas ni filtros.
@Injectable()
export class AlmacenProductos {
  readonly streams = new Map<string, EventoProducto[]>();
  leer(id: string) {
    const eventos = this.streams.get(id) ?? [];
    const precio = eventos.reduce((p, e) => e.precio, 0);
    return { existe: eventos.length > 0, precio, version: eventos.length };
  }
  anexar(id: string, versionEsperada: number, evento: EventoProducto) {
    const eventos = this.streams.get(id) ?? [];
    if (eventos.length !== versionEsperada) throw new Error(`conflicto: ${id} va por la versión ${eventos.length}`);
    this.streams.set(id, [...eventos, evento]);
  }
}

@CommandHandler(CrearProducto)
export class CrearProductoHandler implements ICommandHandler<CrearProducto> {
  constructor(private readonly almacen: AlmacenProductos, private readonly eventos: EventBus) {}
  async execute({ id, nombre, precio }: CrearProducto) {
    if (this.almacen.leer(id).existe) throw new ReglaDeNegocio(`${id} ya existe`);
    if (precio <= 0) throw new ReglaDeNegocio('el precio debe ser positivo');
    const evento = new ProductoCreado(id, 1, nombre, precio);
    this.almacen.anexar(id, 0, evento);
    this.eventos.publish(evento); // el lado de lectura se entera por aquí
    return 1;
  }
}

@CommandHandler(CambiarPrecio)
export class CambiarPrecioHandler implements ICommandHandler<CambiarPrecio> {
  constructor(private readonly almacen: AlmacenProductos, private readonly eventos: EventBus) {}
  async execute({ id, precio }: CambiarPrecio) {
    const actual = this.almacen.leer(id);
    if (!actual.existe) throw new ReglaDeNegocio(`${id} no existe`);
    if (precio > actual.precio * 1.5) throw new ReglaDeNegocio(`subida mayor al 50 % (${actual.precio} → ${precio})`);
    const evento = new PrecioCambiado(id, actual.version + 1, actual.precio, precio);
    this.almacen.anexar(id, actual.version, evento);
    this.eventos.publish(evento);
    return evento.version;
  }
}
