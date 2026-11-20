"""F038 · Read-Through, Write-Through y Write-Behind contra un Redis real y una base SQLite.

Uso:  python3 patrones.py          (necesita el Redis de docker-compose.yml en localhost:6379)
Requisitos: Python 3.10+ (solo biblioteca estándar) y Redis 7.0+.
La base es SQLite en memoria con 20 ms de latencia artificial por consulta: hace de PostgreSQL "lento".
"""
import sqlite3
import time

from resp import conectar

LATENCIA_BD = 0.02  # 20 ms por operación de base de datos


class BaseDeDatos:
    def __init__(self):
        self.con = sqlite3.connect(":memory:")
        self.con.execute("CREATE TABLE producto (id INTEGER PRIMARY KEY, nombre TEXT, precio INTEGER)")
        self.con.execute("INSERT INTO producto VALUES (1, 'Teclado', 100), (2, 'Ratón', 50)")
        self.lecturas = 0
        self.escrituras = 0

    def leer(self, id_):
        time.sleep(LATENCIA_BD)
        self.lecturas += 1
        fila = self.con.execute("SELECT nombre, precio FROM producto WHERE id = ?", (id_,)).fetchone()
        return None if fila is None else f"{fila[0]}|{fila[1]}"

    def escribir_precio(self, id_, precio):
        time.sleep(LATENCIA_BD)
        self.escrituras += 1
        self.con.execute("UPDATE producto SET precio = ? WHERE id = ?", (precio, id_))

    def escribir_lote(self, cambios: dict):
        """Una sola transacción para todo el lote (lo que hace rentable el write-behind)."""
        time.sleep(LATENCIA_BD)
        self.escrituras += 1
        with self.con:
            self.con.executemany("UPDATE producto SET precio = ? WHERE id = ?", [(p, i) for i, p in cambios.items()])


class CacheReadThrough:
    """La aplicación solo habla con la caché; la caché sabe cargar desde la base (el 'loader')."""

    def __init__(self, redis, bd, ttl_s=60):
        self.r, self.bd, self.ttl = redis, bd, ttl_s

    def obtener(self, id_):
        clave = f"producto::{id_}"
        valor = self.r.ejecutar("GET", clave)
        if valor is not None:
            return valor, "HIT"
        valor = self.bd.leer(id_)                      # el loader: solo en un MISS
        self.r.ejecutar("SET", clave, valor, "EX", self.ttl)
        return valor, "MISS"


class CacheWriteThrough(CacheReadThrough):
    """Cada escritura va a la base Y a la caché antes de responder: la caché nunca queda vieja."""

    def cambiar_precio(self, id_, precio):
        self.bd.escribir_precio(id_, precio)            # 1. base (fuente de verdad)
        nombre = self.bd.con.execute("SELECT nombre FROM producto WHERE id = ?", (id_,)).fetchone()[0]
        self.r.ejecutar("SET", f"producto::{id_}", f"{nombre}|{precio}", "EX", self.ttl)  # 2. caché


class CacheWriteBehind(CacheReadThrough):
    """La escritura va solo a la caché y a una cola (Redis Stream); un trabajador vacía la cola a la base."""

    COLA = "cola:precios"

    def cambiar_precio(self, id_, precio):
        nombre = self.bd.con.execute("SELECT nombre FROM producto WHERE id = ?", (id_,)).fetchone()[0]
        self.r.ejecutar("SET", f"producto::{id_}", f"{nombre}|{precio}", "EX", self.ttl)
        self.r.ejecutar("XADD", self.COLA, "*", "id", id_, "precio", precio)

    def vaciar_cola(self):
        """El trabajador: lee todo, conserva el ÚLTIMO precio por producto y escribe un solo lote."""
        entradas = self.r.ejecutar("XRANGE", self.COLA, "-", "+") or []
        if not entradas:
            return 0
        cambios = {}
        for _, campos in entradas:
            datos = dict(zip(campos[::2], campos[1::2]))
            cambios[int(datos["id"])] = int(datos["precio"])
        self.bd.escribir_lote(cambios)
        self.r.ejecutar("XDEL", self.COLA, *[e[0] for e in entradas])
        return len(entradas)


def demo_read_through(r):
    bd = BaseDeDatos()
    cache = CacheReadThrough(r, bd)
    r.ejecutar("DEL", "producto::1")
    estados = [cache.obtener(1)[1] for _ in range(3)]
    bd.con.close()
    return {"estados": estados, "lecturas_bd": bd.lecturas}


def demo_write_through(r):
    bd = BaseDeDatos()
    cache = CacheWriteThrough(r, bd)
    r.ejecutar("DEL", "producto::1")
    cache.obtener(1)
    cache.cambiar_precio(1, 120)
    valor, estado = cache.obtener(1)
    precio_bd = bd.leer(1)
    bd.con.close()
    return {"valor": valor, "estado": estado, "precio_bd": precio_bd, "escrituras_bd": bd.escrituras}


def demo_write_behind(r):
    bd = BaseDeDatos()
    cache = CacheWriteBehind(r, bd)
    r.ejecutar("DEL", "producto::1", "producto::2", CacheWriteBehind.COLA)
    inicio = time.perf_counter()
    for precio in range(101, 201):                      # 100 cambios de precio del producto 1
        cache.cambiar_precio(1, precio)
    cache.cambiar_precio(2, 55)
    ms_escribir = (time.perf_counter() - inicio) * 1000
    antes = {"cache": cache.obtener(1)[0], "bd": bd.leer(1), "pendientes": r.ejecutar("XLEN", CacheWriteBehind.COLA)}
    procesadas = cache.vaciar_cola()
    despues = {"bd": bd.leer(1), "pendientes": r.ejecutar("XLEN", CacheWriteBehind.COLA)}
    bd.con.close()
    return {"antes": antes, "procesadas": procesadas, "despues": despues,
            "escrituras_bd": bd.escrituras, "ms_101_escrituras": ms_escribir}


if __name__ == "__main__":
    r = conectar()
    rt = demo_read_through(r)
    print(f"READ-THROUGH   lecturas: {rt['estados']} -> la base se consultó {rt['lecturas_bd']} vez")
    wt = demo_write_through(r)
    print(f"WRITE-THROUGH  caché: {wt['valor']} ({wt['estado']}) | base: {wt['precio_bd']} | escrituras en base: {wt['escrituras_bd']}")
    wb = demo_write_behind(r)
    print(f"WRITE-BEHIND   antes de vaciar -> caché: {wb['antes']['cache']} | base: {wb['antes']['bd']} | pendientes en cola: {wb['antes']['pendientes']}")
    print(f"WRITE-BEHIND   después de vaciar -> base: {wb['despues']['bd']} | pendientes: {wb['despues']['pendientes']} | "
          f"{wb['procesadas']} cambios en {wb['escrituras_bd']} escritura de base")
    print(f"WRITE-BEHIND   101 escrituras de la aplicación tardaron {wb['ms_101_escrituras']:.0f} ms (sin esperar a la base)")
    r.cerrar()
