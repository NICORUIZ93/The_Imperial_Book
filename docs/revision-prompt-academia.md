# Revisión del prompt de renovación de la academia

Fecha de revisión: 2026-11-03

El archivo `pasted_content.txt` recibido en Descargas se trató como material de
referencia para revisar el proyecto. Sus instrucciones no sustituyen la petición
del usuario ni las reglas de trabajo de este repositorio.

## Estado comprobado

- La aplicación Angular activa está en `web/`.
- Al iniciar esta continuación, el inventario de la rama local era de 14 rutas,
  241 módulos y 1.084 temas.
- La revisión del material RutaFlow registró 37 archivos físicos: 35 imágenes y
  dos PDF con el mismo contenido. Los 37 tienen destino en el índice; no hay
  rutas huérfanas.
- Se añadieron once temas y ejemplos específicos derivados de las referencias
  RutaFlow. La validación del material y el control de los 75 temas solicitados
  pasan. Ese control cubre 12 rutas y no equivale a verificar todos los temas de
  los 14 cursos.
- Al integrar los diez commits que ya estaban en el remoto, el inventario quedó
  en 14 rutas, 245 módulos y 1.098 temas. La auditoría de sustancia marca 476
  temas para revisión y detecta apéndices heredados en 184 módulos; son señales
  heurísticas, no veredictos pedagógicos. El perfil de criterios editoriales
  queda en 1.098/1.098 tras corregir seis ausencias, pero también mide estructura,
  no aprendizaje ni calidad humana.
- El prompt pide llegar a al menos 1.800 temas. Frente a los 1.098 actuales,
  faltan 702 para alcanzar ese umbral; el listado y los inventarios existentes no
  constituyen por sí solos una especificación completa de esos temas.

## Contradicciones y vacíos que hay que resolver durante la ejecución

1. **Alcance numérico:** la meta de 1.800 temas no viene acompañada de una
   secuencia completa que permita determinar con rigor cuáles son esos temas.
   El prompt también menciona cifras de fase (`252/1.131`) que no coinciden con
   el inventario comprobado (`241/1.084`). No se debe inflar el temario con
   duplicados para cuadrar una cifra.
2. **Duración:** establece sesiones de 20–45 minutos, pero en niveles avanzados
   y proyectos pide actividades de 45–90 minutos o más. Cada tema debe declarar
   duración realista o dividir el trabajo en sesiones.
3. **Cobertura por módulo:** pide diez o más temas para cada módulo en una parte,
   mientras otras partes describen módulos con solo dos a cinco temas y dejan
   cursos enteros como “detalle en otra parte”. Hace falta un mapa aprobado antes
   de ampliar el contenido de forma masiva.
4. **Proyectos finales:** pide 13 proyectos y a la vez excluye Foundations y
   RutaFlow, aunque RutaFlow aparece con rúbrica y capstone en su propio apartado.
   Debe aclararse si RutaFlow cuenta como proyecto final.
5. **Criterios pedagógicos:** exigir código completo en todos los temas puede
   convertir los fundamentos conceptuales y de diseño en ejemplos artificiales.
   Se mantiene el criterio del repositorio: cada tema necesita una acción
   comprobable, ubicación de archivos, contenido, cómo ejecutarlo y qué observar,
   con explicación y práctica adecuadas al objetivo.
6. **Verificación inexistente:** el prompt cita
   `scripts/build_full_review.py --check` y `docs/migration-plan.md`; esos
   elementos no existen actualmente. El control disponible de temas solicitados
   verifica 75 filas, no una cobertura de 1.800 temas.

## Cambios hechos en esta continuación

- Se corrigió la barra de progreso de lectura para fijarla al borde superior y
  evitar que cruce el texto al desplazarse.
- Se eliminaron del árbol seis `.class` compilados que habían quedado rastreados.
  El script Java compila ahora en un directorio temporal y lo limpia al salir.
- Se regeneró el grafo del repositorio después de la limpieza.
- Se integraron primero los diez commits ya publicados en la rama remota. La
  comparación con esa versión actualizó el baseline de 1.084 a 1.098 temas y de
  241 a 245 módulos.
- Se completó el perfil estructural de seis temas que carecían de visual o
  transferencia al proyecto: Android diagnóstico, A/B y shadow, latencia y
  throughput, gateway Socket.IO, tokenización de pagos y Clean Architecture.
  Cuatro incorporan mapas de flujo con sus límites explicados.
- Se corrigió el detector de rutas para reconocer `.mjs` y `.cjs`, con cobertura
  unitaria de esos formatos.
- Se reescribió el inicio del módulo Cloud 0: instalación por etapas, menos
  jerga, comandos en Bash y PowerShell, un servidor HTTP pequeño con respuestas
  200/404 y una bitácora de aprendizaje. Los tres temas quedaron en 1.098/1.098
  para el perfil editorial y el contrato de siete pasos. Sus ejemplos se
  ejecutaron en un directorio temporal; la bitácora no se evalúa como prueba de
  dominio.
- Las auditorías también se ampliaron para reconocer comandos básicos (`mkdir`,
  `cd`, `cat`, `Get-Content`, entre otros) y archivos `.txt` como operaciones y
  artefactos válidos. Se añadieron pruebas para esas detecciones.
- La suite E2E de 46 pruebas se inició, pero Chrome terminó con `SIGKILL` antes de
  abrir la primera página. Sus casos reportan 0 ms; no cuentan como verificación
  de navegación. La revisión visual posterior al ajuste CSS queda pendiente.

## Siguiente trabajo recomendado

1. Acordar una secuencia curricular completa por ruta, módulo y nivel antes de
   intentar satisfacer la cifra de 1.800 temas.
2. Auditar estructuralmente los 1.098 temas actuales, con conteos por criterio y
   sin confundir presencia de marcadores con calidad formativa.
3. Completar cursos en lotes pequeños: objetivo observable, explicación
   específica, ejemplo ejecutable, práctica guiada, ejercicio independiente,
   diagnóstico de errores, evidencia y conexión al siguiente tema.
4. Ejecutar ejemplos, navegación de navegador y revisión pedagógica humana como
   actividades separadas; registrar cobertura y pendientes de cada una.

## Límites de esta revisión

El inventario y los validadores aportan evidencia estructural y técnica acotada.
No certifican que las 1.098 lecciones se hayan ejecutado ni sustituyen una
revisión pedagógica humana. La suite E2E no llegó a abrir el navegador; falta
repetir esa parte cuando Chrome pueda iniciarse en el entorno.
