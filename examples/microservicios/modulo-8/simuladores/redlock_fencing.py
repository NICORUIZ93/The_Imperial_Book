"""F039 · Redlock (3 nodos Redis) y fencing tokens, contra Redis reales.

Uso:  python3 redlock_fencing.py   (necesita redis-a/b/c en 6380/6381/6382 y redis en 6379; ver docker-compose.yml)
Requisitos: Python 3.10+ (solo biblioteca estándar) y Redis 7.0+.

Reproduce el razonamiento del algoritmo publicado en https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
y la crítica de Martin Kleppmann (https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html):
un cliente que se pausa más que el TTL del candado sigue creyendo que lo tiene; solo un fencing token
comprobado por el ALMACÉN evita que su escritura tardía pise la del nuevo dueño.
"""
import os
import secrets
import time

from resp import Redis, RespError

NODOS = [int(p) for p in os.environ.get("REDLOCK_PORTS", "6380,6381,6382").split(",")]
PUERTO_ALMACEN = int(os.environ.get("REDIS_PORT", 6379))
FACTOR_DERIVA = 0.01  # 1 % del TTL + 2 ms, como la implementación de referencia

LIBERAR = """
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end
"""
# El almacén solo acepta una escritura si su token es MAYOR que el último que vio.
ESCRIBIR_CON_FENCING = """
local ultimo = tonumber(redis.call('GET', KEYS[2]) or '0')
if tonumber(ARGV[1]) > ultimo then
  redis.call('SET', KEYS[2], ARGV[1]); redis.call('SET', KEYS[1], ARGV[2]); return 1
end
return 0
"""


def _nodo(puerto):
    try:
        return Redis("localhost", puerto, timeout=0.05)   # timeout corto: un nodo caído no frena al resto
    except OSError:
        return None


class Redlock:
    def __init__(self, puertos=NODOS):
        self.puertos = puertos
        self.quorum = len(puertos) // 2 + 1

    def adquirir(self, recurso, ttl_ms):
        valor = secrets.token_hex(16)                      # identifica a ESTE dueño
        inicio = time.monotonic()
        aciertos = 0
        for puerto in self.puertos:
            r = _nodo(puerto)
            if r is None:
                continue
            try:
                if r.ejecutar("SET", recurso, valor, "NX", "PX", ttl_ms) == "OK":
                    aciertos += 1
            except (OSError, RespError):
                pass
            finally:
                r.cerrar()
        transcurrido = (time.monotonic() - inicio) * 1000
        validez = ttl_ms - transcurrido - (ttl_ms * FACTOR_DERIVA + 2)
        if aciertos >= self.quorum and validez > 0:
            return {"valor": valor, "nodos": aciertos, "validez_ms": validez}
        self.liberar(recurso, valor)                       # no hubo mayoría: deshaz lo parcial
        return {"valor": None, "nodos": aciertos, "validez_ms": 0}

    def liberar(self, recurso, valor):
        liberados = 0
        for puerto in self.puertos:
            r = _nodo(puerto)
            if r is None:
                continue
            try:
                liberados += r.ejecutar("EVAL", LIBERAR, 1, recurso, valor)
            except (OSError, RespError):
                pass
            finally:
                r.cerrar()
        return liberados


def limpiar(recurso):
    for puerto in NODOS + [PUERTO_ALMACEN]:
        r = _nodo(puerto)
        if r:
            r.ejecutar("DEL", recurso, "almacen:factura", "almacen:factura:token", "fencing:" + recurso)
            r.cerrar()


def escenario_mayoria():
    lock = Redlock()
    caido = Redlock(NODOS[:2] + [6399])                      # 6399: un nodo que no responde
    dos_caidos = Redlock(NODOS[:1] + [6398, 6399])
    limpiar("lock:factura")
    a = lock.adquirir("lock:factura", 1000)
    lock.liberar("lock:factura", a["valor"])
    b = caido.adquirir("lock:factura", 1000)
    caido.liberar("lock:factura", b["valor"])
    c = dos_caidos.adquirir("lock:factura", 1000)
    return a, b, c


def escenario_pausa(con_fencing: bool):
    """A toma el candado, se pausa (GC, swap...) más que el TTL; B toma el candado y escribe; A despierta y escribe."""
    limpiar("lock:factura")
    lock = Redlock()
    almacen = Redis("localhost", PUERTO_ALMACEN)
    contador = Redis("localhost", NODOS[0])                 # fuente de tokens (ver la nota del curso)

    a = lock.adquirir("lock:factura", 300)
    token_a = contador.ejecutar("INCR", "fencing:lock:factura")
    time.sleep(0.5)                                          # pausa de 500 ms > TTL de 300 ms

    b = lock.adquirir("lock:factura", 300)
    token_b = contador.ejecutar("INCR", "fencing:lock:factura")

    def escribir(texto, token):
        if con_fencing:
            return almacen.ejecutar("EVAL", ESCRIBIR_CON_FENCING, 2, "almacen:factura", "almacen:factura:token", token, texto)
        almacen.ejecutar("SET", "almacen:factura", texto)
        return 1

    acepta_b = escribir("total=200 (B)", token_b)
    acepta_a = escribir("total=100 (A, tarde)", token_a)    # A no sabe que perdió el candado
    liberados_por_a = lock.liberar("lock:factura", a["valor"])  # A intenta soltar: no debe borrar el de B
    final = almacen.ejecutar("GET", "almacen:factura")
    lock.liberar("lock:factura", b["valor"])
    almacen.cerrar(); contador.cerrar()
    return {"a": a, "b": b, "token_a": token_a, "token_b": token_b, "acepta_b": acepta_b,
            "acepta_a": acepta_a, "liberados_por_a": liberados_por_a, "final": final}


if __name__ == "__main__":
    a, b, c = escenario_mayoria()
    print(f"3 nodos vivos      -> candado: {'SÍ' if a['valor'] else 'NO'} ({a['nodos']}/3 nodos, validez {a['validez_ms']:.0f} ms de 1000)")
    print(f"1 nodo caído       -> candado: {'SÍ' if b['valor'] else 'NO'} ({b['nodos']}/3 nodos, quorum 2)")
    print(f"2 nodos caídos     -> candado: {'SÍ' if c['valor'] else 'NO'} ({c['nodos']}/3 nodos, quorum 2)")
    s = escenario_pausa(con_fencing=False)
    print(f"SIN fencing token  -> A y B creyeron tener el candado; valor final: '{s['final']}'  <- se perdió la escritura de B")
    s = escenario_pausa(con_fencing=True)
    print(f"CON fencing token  -> token A={s['token_a']}, token B={s['token_b']}; almacén acepta B: {s['acepta_b']}, "
          f"acepta A: {s['acepta_a']}; valor final: '{s['final']}'")
    print(f"Liberación segura  -> A intentó soltar tras expirar: borró {s['liberados_por_a']} candados (el de B sigue vivo)")
