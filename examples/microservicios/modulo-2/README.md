# Laboratorio · Módulo 0.3 · Java y Node.js lado a lado

Lección: `web/public/content/microservices/modulo-2.md` (fichas F006–F007).

## Requisitos

- JDK 25 LTS (25.0.5). Los programas usan el lanzador de código fuente de varios archivos (JDK 22+).
- Node.js 26.13.1 LTS (también corre en Node 22).
- Sin dependencias externas: ni Maven ni `npm install`. Los tests de Java no usan JUnit (llega en la Fase 1):
  imprimen `✔`/`✖` y terminan con código 1 si algo falla.
- Terminal en UTF-8 para ver bien las tildes en Java (ver «Error común» de la ficha F006).

## Contenido

| Archivo | Ficha | Qué hace |
|---|---|---|
| `java/Tienda.java` · `node/tienda.js` | Sintaxis y ejecución | el mismo programa (cuenta de una papelería) en los dos lenguajes |
| `java/TiendaTest.java` · `node/tienda.test.js` | Sintaxis y ejecución | los mismos 5 casos de prueba |
| `java/Diferencias.java` · `node/diferencias.js` | Tipos, errores y concurrencia | tipos estáticos/dinámicos, excepciones/NaN, hilos virtuales/event loop |
| `java/DiferenciasTest.java` · `node/diferencias.test.js` | Tipos, errores y concurrencia | tests de las tres diferencias |

## Ejecutar

```bash
(cd java && java Tienda.java && java Diferencias.java)
(cd node && node tienda.js && node diferencias.js)
```

## Verificar

```bash
./verificar.sh
```

Resultado esperado: Java 9 comprobaciones en `✔`, Node 10 tests en `✔` y
`RESULTADO: OK · Módulo 0.3 (Java y Node.js lado a lado) verificado`.

No usa infraestructura, así que no tiene `docker-compose.yml`.
