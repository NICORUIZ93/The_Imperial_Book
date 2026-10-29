import argparse
import json
import math
from pathlib import Path
from urllib.request import urlopen


def ruta_url(base, puntos):
    if len(puntos) < 2:
        raise ValueError('Se necesitan al menos dos puntos')
    for lon, lat in puntos:
        if not math.isfinite(lon) or not math.isfinite(lat) or not -180 <= lon <= 180 or not -90 <= lat <= 90:
            raise ValueError('Coordenada inválida')
    coordenadas = ';'.join(f'{lon},{lat}' for lon, lat in puntos)
    return f'{base.rstrip("/")}/route/v1/driving/{coordenadas}?overview=full&geometries=geojson'


def interpretar(payload):
    if payload.get('code') != 'Ok' or not payload.get('routes'):
        raise ValueError('No hay una ruta utilizable')
    ruta = payload['routes'][0]
    for key in ('distance', 'duration'):
        if not isinstance(ruta.get(key), (int, float)) or not math.isfinite(ruta[key]) or ruta[key] < 0:
            raise ValueError('Métrica inválida')
    geometry = ruta.get('geometry', {})
    if geometry.get('type') != 'LineString' or len(geometry.get('coordinates', [])) < 2:
        raise ValueError('Geometría inválida')
    return ruta['distance'], ruta['duration']


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url')
    parser.add_argument('--fixture', default='respuesta.json')
    args = parser.parse_args()
    if args.base_url:
        url = ruta_url(args.base_url, [(13.38886, 52.517037), (13.397634, 52.529407)])
        with urlopen(url, timeout=5) as response:
            payload = json.load(response)
    else:
        payload = json.loads(Path(args.fixture).read_text())
    metros, segundos = interpretar(payload)
    print(f'{metros:g} metros; {segundos:g} segundos')
