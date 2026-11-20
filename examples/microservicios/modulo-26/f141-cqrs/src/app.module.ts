// Módulo 22 · F141 · Los dos lados registrados en el mismo proceso. En producción suelen ser DOS despliegues con
// DOS bases de datos (p. ej. PostgreSQL para escribir y Elasticsearch o Redis para leer) unidos por un broker.
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AlmacenProductos, CrearProductoHandler, CambiarPrecioHandler } from './escritura.js';
import { CatalogoLectura, ProyeccionCatalogo, ListarCatalogoHandler, VerProductoHandler } from './lectura.js';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [
    AlmacenProductos, CrearProductoHandler, CambiarPrecioHandler,             // escritura
    CatalogoLectura, ProyeccionCatalogo, ListarCatalogoHandler, VerProductoHandler, // lectura
  ],
})
export class CatalogoModule {}
