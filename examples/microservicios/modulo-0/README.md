# Laboratorio · Módulo 0.1 · Qué es un programa, un servidor y una API

Lección: `web/public/content/microservices/modulo-0.md` (fichas F001–F003).

## Requisitos

- Node.js 26.13.1 LTS (los ejemplos también corren en Node 22). Sin dependencias externas: no hace falta
  `npm install`.
- `curl` para los mini-laboratorios.

## Contenido

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `programa/` | Qué es un programa | `receta.js` (suma una lista de compras) y su test |
| `servidor/` | Qué es un servidor | `servidor.js` (responde en el puerto 3000 y cuenta pedidos) y su test |
| `api/` | Qué es una API | `api.js` (menú de restaurante: `GET /api/menu`, `GET /api/menu/{id}`, `POST /api/pedidos`) y su test |

## Ejecutar

```bash
node programa/receta.js
node servidor/servidor.js        # Ctrl+C para apagarlo; prueba con curl http://localhost:3000/
node api/api.js                  # prueba con curl http://localhost:3001/api/menu
```

## Verificar

```bash
./verificar.sh
```

Resultado esperado: 8 tests en `✔` y la última línea
`RESULTADO: OK · Módulo 0.1 (programa, servidor y API) verificado`.

No usa infraestructura, así que no tiene `docker-compose.yml`.
