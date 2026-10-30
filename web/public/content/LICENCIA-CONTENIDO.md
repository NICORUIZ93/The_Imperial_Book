# Licencia del contenido original

Salvo donde exista un aviso distinto, la prosa original de las lecciones y la
documentación editorial creada para The Imperial Book se ofrece bajo
[Creative Commons Atribución 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Puedes compartir y adaptar ese material, incluso con fines comerciales, siempre
que atribuyas adecuadamente la autoría, indiques los cambios y enlaces la
licencia. La licencia no concede derechos sobre marcas, nombres de productos ni
material de terceros.

## Exclusiones y avisos

- La documentación traducida o reproducida desde proyectos externos conserva
  las condiciones del mantenedor original y sus avisos de atribución.
- Fotografías, capturas, escaneos de libros, diagramas y otros recursos recibidos
  de terceros no se relicencian por este aviso; úsalos solo conforme a sus
  derechos y permisos.
- El código fuente se distribuye bajo la licencia MIT de la raíz del repositorio.
- Si un archivo tiene un aviso específico, ese aviso prevalece para ese recurso.

Al reutilizar un archivo, comprueba también sus enlaces de fuente y atribución.
Este aviso describe la intención de licencia del contenido original y no otorga
derechos sobre obras ajenas.

## Inventario de recursos de terceros de la aplicación

Este inventario cubre los recursos gráficos distribuidos desde `web/public/` y
las fuentes tipográficas cargadas por Angular. La licencia del código o de la
colección de iconos no sustituye los términos individuales de cada marca. Los
nombres y logotipos siguen sujetos a las marcas y guías de sus titulares.

| Recurso | Origen comprobado | Licencia y estado |
|---|---|---|
| `brands/angular.svg`, `brands/javascript.svg`, `brands/cloud.svg`, `brands/devops.svg`, `brands/node.svg`, `brands/react.svg` | Las rutas coinciden con Simple Icons 16.28.0. El [registro de procedencia](../../../.claude/skills/archify/renderers/shared/generated-brand-marks.mjs) identifica el origen por marca: Angular, JavaScript, Kubernetes, Docker, Node.js y React, respectivamente. | Simple Icons publica la colección bajo CC0 1.0. El registro individual anota Angular como CC BY 4.0 y JavaScript como MIT; para Kubernetes, Docker, Node.js y React no registra una licencia individual. Verifica sus fuentes y guías antes de redistribuir o usar comercialmente. |
| `brands/android.svg`, `brands/flutter.svg`, `brands/foundations.svg`, `brands/ios.svg`, `brands/java.svg`, `brands/kotlin-multiplatform.svg`, `brands/spring-boot.svg` | No se encontró una atribución o registro de procedencia que permita vincular estas rutas con una fuente concreta. | **Pendiente:** confirmar autor, fuente y licencia de cada archivo antes de reutilizarlo. No se presume que CC BY 4.0 del contenido editorial las cubra. |
| `assets/cloud-local-learning-lab.png` | No se encontró metadata de autoría, fuente ni proceso de creación en el repositorio. | **Pendiente:** confirmar autoría y derechos de distribución. No se relicencia como contenido propio hasta resolverlo. |
| Fira Sans, Fira Sans Condensed y Fira Mono (`@fontsource/*` 5.3.0) | Paquetes fijados en [web/package-lock.json](../../../web/package-lock.json). | El lockfile registra SIL Open Font License 1.1 (OFL-1.1) para los tres paquetes. |

El inventario es una revisión de archivos y metadatos locales, no una
autorización legal ni una revisión de políticas de marca. Los recursos marcados
como pendientes requieren validación humana y documentación de su fuente antes
de atribuirles una licencia.
