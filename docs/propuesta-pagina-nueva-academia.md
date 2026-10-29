# Propuesta de página nueva: Academia por rutas, módulos y temas

Fecha: 2026-10-29  
Estado: Fase 1 implementada; Fases 2–4 pendientes
Alcance: catálogo, entrada a una ruta, índice de módulos y lector de temas

## Decisión de diseño

La academia no debe abrir directamente un documento largo. Debe presentar una
ruta de estudio en tres niveles visibles:

1. **Ruta**: qué se aprende, para quién es y cuál es el proyecto que conecta el
   curso.
2. **Módulo**: qué resultado produce este bloque y qué conocimientos prepara.
3. **Tema**: una sola explicación, una práctica y una evidencia; después se
   anuncia el tema siguiente.

La regla principal es **una decisión por pantalla**: elegir una ruta, elegir un
módulo o estudiar un tema. El texto completo sigue existiendo, pero deja de
competir visualmente con el índice y con los controles de navegación.

### Fase 1 entregada

La primera fase ya está aplicada en Angular:

- `/curso/:trackId` abre un mapa de ruta (`track-overview`) antes de cualquier
  lección.
- El catálogo enlaza a la ruta y conserva los accesos directos de `Continuar`
  para el progreso existente.
- La página de ruta muestra resultado, preparación, proyecto, niveles, módulos,
  temas disponibles, duración y estado del recorrido.
- El índice lateral se oculta en el mapa para no duplicar la misma lista.
- El lector muestra una franja de temas del capítulo en el encabezado y mantiene
  el salto por fragmento al tema elegido.
- Las URLs históricas `/curso/:trackId/:moduleId` siguen funcionando.

La metadata rica por tema y la ruta individual `/tema/:topicId` quedan para las
fases siguientes; no se inventaron resúmenes ni prerrequisitos para acelerar
esta primera entrega.

## Qué está causando el cansancio visual ahora

La propuesta parte de la implementación existente, no de una impresión aislada:

| Hallazgo | Evidencia actual | Consecuencia |
|---|---|---|
| La entrada de una ruta salta al módulo 0 | `web/src/app/app.routes.ts` redirige `/curso/:trackId` a `0` | La persona no entiende la arquitectura del curso antes de leer |
| El índice lateral es principalmente una lista | `web/src/app/course/lesson-index.html` muestra nivel, título y número de temas | Hay poca información para elegir el siguiente módulo |
| El lector concentra muchos temas en una columna | `lesson-viewer` agrupa todo el Markdown y solo expande el primer tema | Los temas siguientes parecen escondidos o secundarios |
| En móvil el índice se oculta | `course-shell.scss` convierte el índice en un panel modal | La orientación desaparece mientras se lee |
| La navegación siguiente está al final del capítulo | `.lesson-nav` aparece en el pie del lector | Para seguir hay que recorrer demasiado contenido |

No se debe corregir esto reduciendo el tamaño de la letra ni añadiendo más
tarjetas. El problema es de jerarquía y recorrido, no de falta de decoración.

## Nueva arquitectura de páginas

### 1. Catálogo: «elige una dirección»

Se conserva el catálogo actual como entrada general, pero cada tarjeta debe
mostrar solo cuatro datos:

- nivel de entrada: `Desde cero`, `Con base`, `Proyecto`;
- resultado observable del curso;
- duración aproximada del siguiente módulo, no del curso completo;
- botón principal: `Ver ruta`.

El botón no debe abrir una lección. Debe abrir la página de ruta.

### 2. Página de ruta: «este es tu mapa»

Ruta sugerida: `/curso/:trackId`.

Wireframe de escritorio:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Catálogo   [icono] Java aplicado                 Buscar        ☼          │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ EN ESTA RUTA  │ Java aplicado                                               │
│               │ De la primera clase a un servicio mantenible                │
│ 01 Fundamentos│ [Comenzar desde el módulo 0]                                │
│ 02 Aplicación│ 14 módulos · 86 temas · proyecto: API de inventario          │
│ 03 Integración│                                                             │
│ 04 Experto    │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│               │ │ 01           │ │ 02           │ │ 03           │          │
│ PROGRESO      │ │ Fundamentos  │ │ Aplicación   │ │ Integración  │          │
│ 3/14 módulos  │ │ 4 módulos    │ │ 4 módulos    │ │ 4 módulos    │          │
│               │ │ 0%           │ │ bloqueado*   │ │ bloqueado*   │          │
│               │ └──────────────┘ └──────────────┘ └──────────────┘          │
│               │                                                             │
│               │ Módulos de esta ruta                                       │
│               │ [01] Entorno y lenguaje       4 temas · 4 h   Abrir →      │
│               │ [02] Datos y objetos          6 temas · 6 h   Ver →         │
│               │ [03] Pruebas                  5 temas · 8 h   Ver →         │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

En móvil, la columna izquierda se convierte en una barra superior horizontal
con el nivel actual y el botón `Ver módulos`. Los módulos aparecen como una
lista vertical, nunca como una cuadrícula de tres columnas estrechas.

Cada módulo de esta página debe mostrar:

- número y etapa (`Fundamentos`, `Aplicación`, `Integración`, `Experto`);
- título corto y una frase de resultado;
- cantidad de temas y tiempo estimado del bloque;
- conceptos que prepara, sin presentarlos como prerrequisitos duros salvo que
  exista evidencia en el grafo;
- estado de recorrido: `Siguiente`, `En curso`, `Completado`, `Disponible`;
- una acción única: `Abrir módulo`.

`Bloqueado` no debe usarse si el curso no tiene una dependencia real. Cuando la
secuencia sea recomendada pero no obligatoria, la etiqueta debe decir
`Recomendado después de …`.

### 3. Página de módulo: «sabes qué vas a conseguir»

Ruta sugerida: `/curso/:trackId/modulo/:moduleId`.

La página de módulo es un tablero de estudio, no el texto completo. Su cabecera
debe responder en menos de diez segundos:

- ¿qué aprenderé?
- ¿qué archivo o resultado produciré?
- ¿qué necesito antes?
- ¿cuál es el primer tema?

Wireframe:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Java · Módulo 02 de 14                                      2/6 temas       │
│ Datos y objetos                                                            │
│ Modela datos con clases, colecciones y contratos verificables.              │
│ Resultado: inventario persistente con pruebas de casos límite.              │
│ [Comenzar tema 1]  [Ver requisitos]                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ TEMAS DEL MÓDULO                                                           │
│                                                                             │
│ 01  Modelo mental        12 min   Comprender   ✓ Completado                 │
│     Qué representa un objeto y qué no.                        Repasar →   │
│                                                                             │
│ 02  Colecciones           25 min   Construir    ● Siguiente                  │
│     Elegir una colección según la operación.                   Abrir →      │
│                                                                             │
│ 03  Contratos             30 min   Probar       ○ Disponible                 │
│     Validar invariantes con casos normales y límite.            Ver →       │
│                                                                             │
│ 04  Proyecto incremental  45 min   Integrar     ○ Disponible                 │
│     Unir los conceptos en una entrega reproducible.             Ver →       │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIGUIENTE MÓDULO · Pruebas y calidad                              Ver mapa → │
└─────────────────────────────────────────────────────────────────────────────┘
```

El título, descripción y resultado se obtienen de `CourseModule`. La ficha de
cada tema requiere un pequeño manifiesto editorial; no se deben inventar
resúmenes genéricos a partir del título.

### 4. Lector de tema: «una práctica completa»

Ruta sugerida: `/curso/:trackId/modulo/:moduleId/tema/:topicId`.

El lector debe mostrar un tema por vez. La distribución de escritorio propone:

```text
┌─────────────┬─────────────────────────────────────────────┬───────────────┐
│ MÓDULO      │ Tema 02 · Colecciones                       │ CONTEXTO      │
│             │ Aplicación · 25 min                         │               │
│ 01 ✓        │ Qué vas a conseguir                         │ Resultado     │
│ 02 ● actual │ [frase de objetivo observable]              │ del módulo    │
│ 03 ○        │                                             │ archivo       │
│ 04 ○        │ Explicación                                │ esperado      │
│             │ texto con ancho de lectura 68–74ch          │               │
│             │                                             │ Conceptos     │
│             │ Ejemplo                                     │ clave         │
│             │ archivo, comando, salida esperada            │               │
│             │                                             │               │
│             │ Práctica guiada                             │               │
│             │ paso 1 · pista · comprobación                │               │
│             │                                             │               │
│             │ Evidencia                                   │               │
│             │ qué guardar y cómo explicar por qué funciona │               │
│             │                                             │               │
│             │ [Marcar tema revisado]                       │               │
│             │ ← Tema anterior       Tema siguiente →       │               │
└─────────────┴─────────────────────────────────────────────┴───────────────┘
```

En pantallas pequeñas, el contexto pasa a un bloque plegable antes del texto y
la navegación `Tema anterior / Tema siguiente` queda fija al final del tema.
El botón `Siguiente` siempre debe verse después de la evidencia, sin obligar a
buscarlo en el pie de todo el capítulo.

## Modelo de contenido que hace posible la página

El índice actual (`topic-index.json`) solo contiene título y fragmento. Para
ordenar temas con calidad se propone agregar un manifiesto generado a partir del
Markdown y revisado editorialmente:

```ts
export interface TopicCard {
  id: string;                 // estable, no depende del texto traducido
  trackId: string;
  moduleId: number;
  order: number;
  title: string;
  fragment: string;
  summary: string;            // 1–2 frases específicas, no plantilla
  outcome: string;             // acción observable
  duration: string;
  evidence: string;           // archivo, salida o explicación que se conserva
  prerequisiteIds: string[];   // solo dependencias verificadas
  level: 'Fundamentos' | 'Aplicación' | 'Integración' | 'Experto';
  editorialStatus: 'revisado' | 'pendiente';
}
```

Reglas del manifiesto:

- `summary`, `outcome` y `evidence` se escriben para el tema real; no se
  rellenan con texto genérico.
- `editorialStatus: pendiente` se muestra como pendiente de revisión humana,
  no como aprobado ni como certificado.
- El orden del curso se conserva, pero una recomendación no se convierte en
  bloqueo sin una relación de prerrequisito explícita.
- El contenido Markdown sigue siendo la fuente de explicación. El manifiesto
  organiza y orienta; no reemplaza la lección.

## Cambios visuales concretos

1. **Más aire vertical**: 24–32 px entre bloques de lectura, 68–74 caracteres por
   línea y 1.8–1.9 de interlineado para el cuerpo.
2. **Menos superficies simultáneas**: una tarjeta solo para la decisión actual;
   el resto se presenta como lista con separación, no como paneles anidados.
3. **Jerarquía tipográfica estable**: título de ruta, título de módulo, título de
   tema y pasos con tamaños claramente diferenciados; evitar mayúsculas largas
   para texto que haya que leer.
4. **Estado con texto y color**: `Siguiente`, `En curso`, `Completado` y
   `Disponible` siempre aparecen escritos; el color no es la única señal.
5. **Siguiente acción persistente**: en el lector, una barra inferior con tema
   anterior/siguiente; en el módulo, el próximo módulo visible.
6. **Modo concentración real**: oculta el índice y el contexto, pero conserva el
   título del tema, progreso de lectura y botón para salir.
7. **Movimiento mínimo**: transiciones cortas, sin animar la entrada de cada
   párrafo; respetar `prefers-reduced-motion` y conservar todos los controles.

## Plan de implementación por fases

### Fase 1 — jerarquía sin migrar contenido

- Cambiar el redirect de `/curso/:trackId` por una página de ruta.
- Convertir el índice lateral en una lista de módulos con resultado y estado.
- Mantener el lector actual como fallback para no romper enlaces guardados.
- Llevar `Tema siguiente` al encabezado y al final de cada tema.

### Fase 2 — manifiesto de temas

- Extender `scripts/build_web_topic_index.py` para generar `topic-catalog.json`.
- Añadir revisión de `summary`, `outcome`, `evidence` y prerrequisitos por tema.
- Mostrar pendientes editoriales sin maquillarlos como cobertura completa.
- Regenerar repo-graph, índices, auditorías y reportes afectados.

### Fase 3 — lector de tema individual

- Añadir rutas de tema sin eliminar la URL histórica de módulo.
- Hacer que el módulo sea la lista de temas y el lector cargue solo uno.
- Conservar fragmentos existentes mediante redirecciones compatibles.
- Mantener las prácticas y los ejemplos específicos del Markdown.

### Fase 4 — validación con personas

- Revisar la entrada, una ruta y un módulo con una persona que no conozca el
  repositorio.
- Medir si encuentra el siguiente tema sin ayuda y si puede explicar qué debe
  guardar como evidencia.
- Ejecutar pruebas de navegador a 375, 768, 1280 y 1920 px, teclado, modo
  oscuro, copia/restauración y movimiento reducido.
- Registrar por separado: revisión estructural, ejecución de ejemplos, prueba
  de navegador y revisión pedagógica humana.

## Criterios de aceptación

- Desde el catálogo se llega a una página de ruta antes de abrir una lección.
- En la página de ruta, una persona puede explicar el propósito, la etapa y el
  proyecto del curso sin abrir el Markdown.
- En la página de módulo se ven todos los temas del bloque con título, objetivo,
  duración, evidencia y estado.
- El lector muestra un solo tema como foco y anuncia el siguiente sin recorrer
  todo el capítulo.
- En móvil ningún control esencial depende de que el índice lateral esté
  visible.
- El cuerpo no supera 74 caracteres de ancho en lectura y no usa texto
  justificado.
- No se añaden puntos, insignias ni cuestionarios generados como sustitutos de
  evidencia.
- Los enlaces históricos `/curso/:trackId/:moduleId#fragment` siguen abriendo el
  contenido correcto durante la migración.
- Build, pruebas Angular, E2E y `./scripts/validate.sh` pasan; los pendientes
  técnicos y de revisión humana se reportan explícitamente.

## Qué no debe hacer la nueva página

- No mostrar los 14 cursos y todos sus temas con el mismo peso visual.
- No convertir el progreso marcado en una certificación de comprensión.
- No esconder la explicación detrás de un acordeón que obligue a abrir diez
  bloques para saber de qué trata el módulo.
- No inventar resúmenes, prerrequisitos ni resultados porque falte metadata.
- No usar capturas o diagramas decorativos para tapar una explicación débil.

La propuesta permite renovar la interfaz sin reescribir de golpe los 1.082
temas: primero mejora el mapa y la carga visual, después añade metadata honesta
y finalmente separa el lector por tema cuando el contenido esté preparado.
