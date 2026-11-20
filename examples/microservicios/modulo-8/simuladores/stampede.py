"""F040 · Cache stampede (estampida) y su solución con un candado por clave, contra un Redis real.

Uso:  python3 stampede.py      (necesita el Redis de docker-compose.yml en localhost:6379)
Requisitos: Python 3.10+ (solo biblioteca estándar) y Redis 7.0+.
50 hilos piden a la vez la misma clave fría; la "base de datos" tarda 200 ms por consulta.
"""
import secrets
import threading
import time

from resp import RespError, conectar

HILOS = 50
LATENCIA_BD = 0.2
LIBERAR = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end"


class Base:
    def __init__(self):
        self.consultas = 0
        self._mutex = threading.Lock()

    def consultar(self, id_):
        with self._mutex:
            self.consultas += 1
        time.sleep(LATENCIA_BD)                            # consulta cara
        return f"producto-{id_}"


def sin_proteccion(r, base, id_):
    clave = f"producto::{id_}"
    valor = r.ejecutar("GET", clave)
    if valor is None:                                      # todos ven MISS a la vez...
        valor = base.consultar(id_)                        # ...y todos van a la base
        r.ejecutar("SET", clave, valor, "EX", 60)
    return valor


def con_candado(r, base, id_, primer_ganador_muere=None, ttl_candado_ms=2000):
    clave, candado = f"producto::{id_}", f"lock:producto::{id_}"
    limite = time.monotonic() + 5
    while time.monotonic() < limite:
        valor = r.ejecutar("GET", clave)
        if valor is not None:
            return valor
        token = secrets.token_hex(8)
        if r.ejecutar("SET", candado, token, "NX", "PX", ttl_candado_ms) == "OK":
            valor = r.ejecutar("GET", clave)               # doble comprobación: otro pudo llenarla
            if valor is None:
                valor = base.consultar(id_)
                if primer_ganador_muere is not None and not primer_ganador_muere.is_set():
                    primer_ganador_muere.set()
                    raise SystemExit                        # el ganador "muere": no escribe ni suelta
                r.ejecutar("SET", clave, valor, "EX", 60)
            r.ejecutar("EVAL", LIBERAR, 1, candado, token)
            return valor
        time.sleep(0.02)                                    # perdedores: esperan y vuelven a mirar la caché
    raise TimeoutError("la caché no se llenó a tiempo")


def carrera(estrategia, id_, **kw):
    r0 = conectar()
    r0.ejecutar("DEL", f"producto::{id_}", f"lock:producto::{id_}")
    r0.cerrar()
    base = Base()
    barrera = threading.Barrier(HILOS)
    resultados, errores = [], []

    def trabajador(n):
        r = conectar()
        barrera.wait()                                      # todos arrancan a la vez
        try:
            resultados.append(estrategia(r, base, id_, **kw))
        except SystemExit:
            errores.append("murió")
        except (TimeoutError, RespError) as e:
            errores.append(str(e))
        finally:
            r.cerrar()

    inicio = time.monotonic()
    hilos = [threading.Thread(target=trabajador, args=(n,)) for n in range(HILOS)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    return {"consultas": base.consultas, "respuestas": len(resultados), "errores": errores,
            "ms": (time.monotonic() - inicio) * 1000}


if __name__ == "__main__":
    a = carrera(sin_proteccion, 1)
    print(f"SIN protección  -> {a['respuestas']} respuestas, {a['consultas']} consultas a la base")
    b = carrera(con_candado, 2)
    print(f"CON candado     -> {b['respuestas']} respuestas, {b['consultas']} consulta a la base")
    c = carrera(con_candado, 3, primer_ganador_muere=threading.Event(), ttl_candado_ms=500)
    print(f"Ganador muere   -> {c['respuestas']} respuestas, {len(c['errores'])} hilo muerto, {c['consultas']} consultas "
          f"a la base (el candado expiró a los 500 ms y otro hilo recargó) en {c['ms']:.0f} ms")
