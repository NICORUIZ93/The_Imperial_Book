#!/usr/bin/env python3
"""Servicios de juguete para los mini-laboratorios del Módulo 7 (solo biblioteca estándar, Python 3.10+).

Sirve los archivos de una carpeta como JSON (Content-Type: application/json), con latencia opcional.
Uso: python3 servicios-falsos.py PUERTO CARPETA [LATENCIA_MS]
  /tmp/s/productos/7  ->  GET http://localhost:PUERTO/productos/7
"""
import functools
import http.server
import sys
import time


class Manejador(http.server.SimpleHTTPRequestHandler):
    latencia_ms = 0

    def guess_type(self, path):
        return "application/json"

    def do_GET(self):
        time.sleep(self.latencia_ms / 1000)
        super().do_GET()


if __name__ == "__main__":
    puerto, carpeta = int(sys.argv[1]), sys.argv[2]
    Manejador.latencia_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    servidor = http.server.ThreadingHTTPServer(("", puerto), functools.partial(Manejador, directory=carpeta))
    print(f"sirviendo {carpeta} como JSON en :{puerto} (latencia {Manejador.latencia_ms} ms)", flush=True)
    servidor.serve_forever()
