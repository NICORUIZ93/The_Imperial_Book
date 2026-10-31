# The Imperial Book: trabajo con contenido y experiencia de estudio

Lee primero `docs/repo-graph.md`. La aplicación oficial es Angular (`web/`);
las lecciones reales están en `web/public/content/<track>/modulo-N.md`.

## Skills para el objetivo de la academia

Consulta `docs/SKILLS-VISUALES-Y-ESTUDIO.md` y su manifiesto de instalación.
Lee el `SKILL.md` correspondiente antes de usarlo; la instalación de una skill
no prueba que la aplicación ni una lección hayan sido verificadas.

- Usa `archify` para diagramas técnicos interactivos con relaciones respaldadas
  por el código o por supuestos expresamente declarados.
- Usa `manimce-best-practices` para animaciones de algoritmos, señales y
  matemáticas. Distingue código de escena de video realmente renderizado.
- Usa `svg-animation` y `accessible-animation` cuando incorpores movimiento web.
  Conserva controles de pausa, pasos manuales y una alternativa sin movimiento.
- Usa `webapp-testing` para navegación, interacción, persistencia y errores;
  `web-design-reviewer` para revisión visual, teclado y tamaños de pantalla.
- Usa `scope-and-sequence-designer` al ordenar cursos y prerrequisitos;
  `backwards-design-unit-planner` al alinear objetivo, evidencia y práctica;
  `competency-unpacker` cuando un objetivo no describa acciones observables.

## Contrato de estudio desde cero

La revisión recorre entrada al sitio → primera sesión → entorno → ejemplo básico
→ explicación → práctica guiada → ejercicio independiente → fallo diagnosticado
→ siguiente tema → proyecto → conservación del progreso.

Aplica los prompts adaptados de `docs/PROMPTS-FORMACION.md`. Cada tema debe
indicar qué archivo crear, dónde, con qué contenido, cómo ejecutar y qué observar.
No reemplaces explicaciones específicas por plantillas, imágenes o promesas.
No añadas cuestionarios generados, puntos o insignias. La comprensión requiere
práctica y explicación; una marca de finalización no la acredita.

Mantén separados: revisión estructural de todos los temas, ejecución de ejemplos,
pruebas de navegador y revisión pedagógica humana. Reporta cobertura y pendientes
sin presentar detección de marcadores como formación completa o certificación.

## Verificación

Al cambiar contenido, metadatos o estructura, regenera los índices y reportes
afectados y ejecuta `./scripts/validate.sh`. Al cambiar la aplicación, ejecuta
build y las pruebas relevantes desde `web/`. Para el Chrome instalado puede usarse
`PLAYWRIGHT_CHANNEL=chrome npm run e2e`; documenta cualquier cierre incompleto.
Las referencias a librerías y versiones se contrastan con documentación primaria.
