// Módulo 22 · F140 · Proyección materializada: convierte los eventos de F139 en una TABLA lista para consultar.
// Requisitos: Node.js 26.13.1 LTS con node:sqlite integrado (SQLite 3.54.1; sin dependencias). Lee de cualquier almacén
// de F139 (memoria o MongoDB) con leerDesde(posicion).
//
// Regla de oro: el cambio en la tabla y el checkpoint (hasta qué posición llegó) se guardan en la MISMA transacción.
// Si el proceso muere a mitad, la transacción se deshace entera y al volver empieza desde el último checkpoint:
// ningún evento se aplica dos veces ni se salta.
import { DatabaseSync } from 'node:sqlite';

export class ProyeccionResumenPedidos {
  nombre = 'resumen_pedidos';

  constructor(almacen, { archivo = ':memory:', alAplicar = () => {} } = {}) {
    this.almacen = almacen;
    this.alAplicar = alAplicar; // gancho para los tests (simular una caída a mitad de lote)
    this.db = new DatabaseSync(archivo);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resumen_pedidos (
        id TEXT PRIMARY KEY, cliente TEXT, estado TEXT, lineas INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS checkpoints (nombre TEXT PRIMARY KEY, posicion INTEGER NOT NULL);
      INSERT OR IGNORE INTO checkpoints VALUES ('${this.nombre}', 0);`);
    this.sql = {
      // INSERT OR IGNORE es idempotente; el UPDATE con «total = total + ?» NO lo es: por eso hace falta el checkpoint.
      crear: this.db.prepare('INSERT OR IGNORE INTO resumen_pedidos (id, cliente, estado) VALUES (?, ?, ?)'),
      linea: this.db.prepare('UPDATE resumen_pedidos SET lineas = lineas + 1, total = total + ? WHERE id = ?'),
      estado: this.db.prepare('UPDATE resumen_pedidos SET estado = ? WHERE id = ?'),
      leerCheckpoint: this.db.prepare('SELECT posicion FROM checkpoints WHERE nombre = ?'),
      guardarCheckpoint: this.db.prepare('UPDATE checkpoints SET posicion = ? WHERE nombre = ?'),
    };
  }

  checkpoint() { return this.sql.leerCheckpoint.get(this.nombre).posicion; }

  // Un manejador por tipo de evento. Los tipos que no le interesan se ignoran (la proyección no es el agregado).
  aplicar(id, { tipo, datos }) {
    if (tipo === 'PedidoCreado') this.sql.crear.run(id, datos.cliente, 'ABIERTO');
    else if (tipo === 'LineaAgregada') this.sql.linea.run(datos.cantidad * datos.precio, id);
    else if (tipo === 'PedidoConfirmado') this.sql.estado.run('CONFIRMADO', id);
    else if (tipo === 'PedidoCancelado') this.sql.estado.run('CANCELADO', id);
  }

  // Lee lotes desde el checkpoint hasta alcanzar el final del almacén. Devuelve cuántos commits aplicó.
  async ponerseAlDia({ lote = 100 } = {}) {
    let aplicados = 0;
    for (;;) {
      const commits = await this.almacen.leerDesde(this.checkpoint(), lote);
      if (commits.length === 0) return aplicados;
      for (const commit of commits) {
        const id = commit.stream.replace(/^pedido-/, '');
        this.db.exec('BEGIN');
        try {
          for (const evento of commit.eventos) { this.alAplicar(evento); this.aplicar(id, evento); }
          this.sql.guardarCheckpoint.run(commit.posicion, this.nombre);
          this.db.exec('COMMIT');
          aplicados++;
        } catch (error) {
          this.db.exec('ROLLBACK');
          throw error;
        }
      }
    }
  }

  // Reconstruir: borrar la tabla y repetir TODOS los eventos. Así cambias el esquema de la vista o arreglas un bug.
  async reconstruir() {
    this.db.exec(`DELETE FROM resumen_pedidos; UPDATE checkpoints SET posicion = 0 WHERE nombre = '${this.nombre}';`);
    return this.ponerseAlDia();
  }

  consultar(sql, ...parametros) { return this.db.prepare(sql).all(...parametros); }
}
