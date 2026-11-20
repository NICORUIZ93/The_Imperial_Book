// Módulo 31 · F178 · Las dos bases de datos durante la coexistencia, con SQLite embebido en Node (node:sqlite, SQLite 3.54.1).
// - Monolito: tabla legado PEDIDOS (columnas de 2009) y un TRIGGER que anota cada cambio en CAMBIOS (captura de cambios).
// - Servicio nuevo «pedidos»: su propia base, con su propio modelo, y la posición hasta donde ha leído.
// En producción el monolito sería PostgreSQL y la captura, Debezium leyendo el WAL (Módulo 25); la idea es la misma.
import { DatabaseSync } from 'node:sqlite';

export function crearMonolitoBD() {
  const bd = new DatabaseSync(':memory:');
  bd.exec(`
    CREATE TABLE PEDIDOS (NUM_PED TEXT PRIMARY KEY, COD_CLI TEXT NOT NULL, EST CHAR(1) NOT NULL, IMPORTE TEXT NOT NULL);
    CREATE TABLE CAMBIOS (pos INTEGER PRIMARY KEY AUTOINCREMENT, op TEXT, num_ped TEXT, cod_cli TEXT, est TEXT, importe TEXT);
    CREATE TRIGGER pedidos_ins AFTER INSERT ON PEDIDOS BEGIN
      INSERT INTO CAMBIOS (op, num_ped, cod_cli, est, importe) VALUES ('c', NEW.NUM_PED, NEW.COD_CLI, NEW.EST, NEW.IMPORTE); END;
    CREATE TRIGGER pedidos_upd AFTER UPDATE ON PEDIDOS BEGIN
      INSERT INTO CAMBIOS (op, num_ped, cod_cli, est, importe) VALUES ('u', NEW.NUM_PED, NEW.COD_CLI, NEW.EST, NEW.IMPORTE); END;
    CREATE TRIGGER pedidos_del AFTER DELETE ON PEDIDOS BEGIN
      INSERT INTO CAMBIOS (op, num_ped) VALUES ('d', OLD.NUM_PED); END;`);
  return bd;
}

export function crearServicioBD() {
  const bd = new DatabaseSync(':memory:');
  bd.exec(`
    CREATE TABLE pedido (id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL, estado TEXT NOT NULL, total_centimos INTEGER NOT NULL);
    CREATE TABLE posicion (fuente TEXT PRIMARY KEY, pos INTEGER NOT NULL);
    INSERT INTO posicion VALUES ('monolito', 0);`);
  return bd;
}
