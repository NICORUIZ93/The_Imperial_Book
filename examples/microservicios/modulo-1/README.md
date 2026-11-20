# Laboratorio · Módulo 0.2 · Lógica de programación y pensamiento computacional

Lección: `web/public/content/microservices/modulo-1.md` (fichas F004–F005).

## Requisitos

- Node.js 26.13.1 LTS (también corre en Node 22). Sin dependencias externas.

## Contenido

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `logica/` | Lógica de programación | `cine.js`: variables, decisiones, operadores lógicos, bucles y funciones (taquilla de cine) y su test |
| `pensamiento/` | Pensamiento computacional | `cambio.js`: descomposición, patrones, abstracción y algoritmo voraz para dar el vuelto, y su test |

## Ejecutar

```bash
node logica/cine.js
node pensamiento/cambio.js
```

## Romper a propósito

En `logica/cine.js` cambia `edad >= 60` por `edad > 60` y ejecuta
`node --test --test-reporter=spec logica/cine.test.js`: falla «los bordes de edad caen en la tarifa correcta».

## Verificar

```bash
./verificar.sh
```

Resultado esperado: 11 tests en `✔` y `RESULTADO: OK · Módulo 0.2 (lógica y pensamiento computacional) verificado`.

No usa infraestructura, así que no tiene `docker-compose.yml`.
