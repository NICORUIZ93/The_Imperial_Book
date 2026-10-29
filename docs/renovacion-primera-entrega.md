# Renovación: portada y primera sesión

Fecha: 2026-10-29. Aplicación revisada: Angular en `web/`, servidor local en `http://127.0.0.1:4201`.

## Alcance entregado

La entrada pasa de prometer «de cero a master» a una acción observable: crear y ejecutar un programa pequeño. La portada presenta el ejemplo, requisitos y resultado antes del catálogo; ofrece acceso a especialidades y un espacio para continuar por el siguiente capítulo sin marcar de cada ruta con progreso. Las marcas se describen como registro de recorrido y no como prueba de aprendizaje. Se conservaron los controles de backup/restauración y los cambios locales previos.

La primera sesión de Fundamentos 0 se reescribió en cuatro temas: ejecutar un saludo, localizar archivos, leer comandos y diagnosticar un error de sintaxis. Se mantuvieron los títulos para conservar sus referencias. La preparación define editor, archivo, carpeta y terminal; distingue Windows de macOS/Linux. El tema complementario existente sobre atajos se conserva. No se reescribieron React 6 ni Java 5 en esta entrega.

Se retiró de la primera sesión el bloque de preparación genérico del lector que anteponía Git, entornos virtuales y una suite inexistente en la carpeta del principiante. La preparación específica vive en el Markdown. Se simplificó el texto de la escala del lector a «Etapa del recorrido».

## Alineación de aprendizaje

| Resultado observable | Evidencia | Preparación y práctica |
|---|---|---|
| Guardar y ejecutar un archivo | Salida de `saludo.py` y `presentacion.py`; explicación de guardar frente a ejecutar | Ejemplo completo de `print`, cambio de mensaje y archivo independiente |
| Encontrar el mismo archivo desde otra carpeta | Ubicación antes/después del cambio, error y rutas correctas | `mkdir`, `cd`, `pwd`, ejecución relativa y absoluta |
| Distinguir programa, opción y argumento | Dos comandos anotados y diagnóstico de opción desconocida | Consulta de versión, ayuda y selección de otro archivo |
| Leer una entrada y corregir sintaxis | Ejecución con dos ciudades, error y corrección registrados | `input`, variable, cadena formateada y comilla ausente |

Esta secuencia se apoya en los archivos y objetivos existentes del módulo. La transición a variables y entrada ocurre después de poder guardar, ejecutar y localizar un archivo. Persistencia, buffers y concurrencia se excluyen de la primera sesión; no se exige conocerlos para avanzar.

## Verificación realizada

- Arranque: `npm ci --no-audit --no-fund` restauró las dependencias ausentes de fuentes. No se cambió el manifiesto ni el lockfile para resolverlo.
- Build de producción correcto. Advertencia pendiente: bundle inicial de 616,25 kB frente a presupuesto de aviso de 600 kB; no se amplió el presupuesto.
- Unitarias: 14 pruebas correctas, cierre con código 0.
- Chrome: 40 pruebas E2E correctas en escritorio y móvil, cierre con código 0. Incluyen entrada a primera sesión, búsqueda con teclado, navegación, backup/restauración y persistencia. Se añadió una comprobación que marca Fundamentos 0, vuelve al catálogo, recarga y abre el siguiente capítulo.
- Revisión visual de portada en claro y oscuro; capturas de escritorio y móvil. Comprobación de ancho sin desbordamiento a 390, 768, 1366 y 1920 px. El recorrido E2E existente también comprueba 375 px y los controles móviles del mapa.
- Cuatro demostraciones Python extraídas del Markdown y ejecutadas con el Python local en macOS: saludo, ubicación, selección de archivo y entrada `Ana`. Fallo de sintaxis reproducido. No se ejecutaron las variantes en Windows/Linux, las instalaciones por sistema ni todas las prácticas independientes.
- Revisión puntual de `/curso/foundations/15`, `/curso/javascript/5` y `/curso/javascript/11`: sin estado de error visible ni geometría SVG con NaN en la comprobación actual. No se modificaron sus diagramas para esta entrega.
- `./scripts/validate.sh` correcto: 11 pruebas Python, con cuatro omitidas por disponibilidad de herramientas PostgreSQL. Los controles editoriales, de fuentes, currículo, ejemplos del PDF, fences e índices completaron su ejecución.
- Se regeneraron auditorías de calidad y código/visuales, backlog, índice web, grafo de prerrequisitos y grafo del repositorio. El inventario actual contiene 14 tracks, 241 módulos y 1.062 temas. Los 1.062 perfiles detectados por heurísticas no acreditan revisión pedagógica humana ni ejecución total.

## Fuentes primarias consultadas

- [Invocar el intérprete Python](https://docs.python.org/3/tutorial/interpreter.html).
- [Entrada y salida en Python](https://docs.python.org/3/tutorial/inputoutput.html).
- [Ejecutar Python en VS Code](https://code.visualstudio.com/docs/python/run).

El PDF se mantiene como referencia documental previamente trazada; sus prompts no sustituyen los objetivos ni las pruebas. No se presenta la popularidad de un prompt como evidencia educativa.

## Siguientes lotes

1. React 6: completar instalación, proveedor, componente y API reproducible; ejecutar desde carpeta vacía y contrastar el comportamiento con documentación primaria.
2. Java 5: entregar clases y métodos completos; eliminar afirmaciones de rendimiento sin medición; ejecutar casos normales y fallidos.
3. Revisar el orden de especialidades y dependencias conceptuales, distinguiendo recomendaciones de requisitos obligatorios. Evitar exigir todas las profundizaciones de Fundamentos para empezar un lenguaje.
4. Extender la revisión editorial por riesgo a los demás módulos. Registrar por separado lectura humana, ejecución técnica y prueba de navegador.
5. Probar la primera sesión con una persona principiante y ajustar según los bloqueos observados. Esta prueba humana aún está pendiente.

La sección para continuar usa capítulos marcados, no recuerda la última posición de lectura ni acredita dominio. No se implementaron sincronización entre dispositivos, nuevos cuestionarios, puntos, insignias ni publicación en hosting.
