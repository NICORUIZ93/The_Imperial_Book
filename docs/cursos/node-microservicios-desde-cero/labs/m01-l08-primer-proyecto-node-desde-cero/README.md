# Lab M01-L08 — Primer proyecto Node desde cero

## Qué se construyó
Proyecto Node.js + TypeScript con `package.json`, `tsconfig.json`, código fuente, compilación a `dist/`, test y verificación automática.

## Prerrequisitos
- Node.js 20+ y npm.

## Cómo compilar
```bash
npm install
npm run build
```

## Cómo ejecutar
```bash
npm start
```

## Output esperado
```text
Hola, estudiante. Proyecto Node listo.
```

## Cómo verificar
```bash
./verify.sh
```

## Qué modificar para experimentar
Cambia el texto en `src/index.ts` y ejecuta `./verify.sh`; debe fallar por contrato de salida.

## Error común
Ejecutar `npm start` sin `npm run build` genera error por falta de `dist/`.
