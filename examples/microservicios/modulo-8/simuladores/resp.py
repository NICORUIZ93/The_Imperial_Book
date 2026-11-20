"""Cliente Redis mínimo (protocolo RESP2) solo con la biblioteca estándar de Python.

Módulo 4 (modulo-8) · Los simuladores hablan con un Redis REAL (el de docker-compose.yml) sin instalar
paquetes: así ves los comandos exactos (SET NX PX, EVAL, INCR...) que también usa el código Spring.
Requisitos: Python 3.10+ (probado con 3.13.18) y Redis 7.0+ (probado con 7.0.15; el laboratorio usa 8.10.2).
"""
import os
import socket


class RespError(Exception):
    """Error devuelto por Redis (respuesta que empieza con '-')."""


class Redis:
    def __init__(self, host: str = "localhost", port: int = 6379, timeout: float = 2.0):
        self.host, self.port = host, port
        self.sock = socket.create_connection((host, port), timeout=timeout)
        self.archivo = self.sock.makefile("rb")

    def ejecutar(self, *partes):
        """Envía un comando como arreglo RESP y devuelve la respuesta ya decodificada."""
        datos = [p if isinstance(p, bytes) else str(p).encode() for p in partes]
        trama = b"*%d\r\n" % len(datos) + b"".join(b"$%d\r\n%s\r\n" % (len(d), d) for d in datos)
        self.sock.sendall(trama)
        return self._leer()

    def _leer(self):
        linea = self.archivo.readline()
        if not linea:
            raise ConnectionError("Redis cerró la conexión")
        tipo, resto = linea[:1], linea[1:-2]
        if tipo == b"+":
            return resto.decode()
        if tipo == b"-":
            raise RespError(resto.decode())
        if tipo == b":":
            return int(resto)
        if tipo == b"$":
            n = int(resto)
            if n == -1:
                return None
            valor = self.archivo.read(n + 2)[:-2]
            return valor.decode()
        if tipo == b"*":
            n = int(resto)
            return None if n == -1 else [self._leer() for _ in range(n)]
        raise RespError(f"respuesta desconocida: {linea!r}")

    def cerrar(self):
        self.sock.close()


def conectar(variable: str = "REDIS_PORT", defecto: int = 6379) -> Redis:
    """Conecta a localhost:<puerto>; el puerto se puede cambiar con una variable de entorno."""
    return Redis(os.environ.get("REDIS_HOST", "localhost"), int(os.environ.get(variable, defecto)))
