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

### Profundidad obligatoria de temas y subtemas

No consideres cubierto un concepto porque aparece dentro del título, una lista,
un párrafo o un ejemplo de otro concepto. Antes de redactar cada tema, descompón
su mapa de subtemas esenciales usando documentación primaria, libros revisados y
errores profesionales frecuentes. Clasifica cada subtema como prerrequisito,
núcleo, variante, límite, diagnóstico o profundización.

Todo subtema **crítico** —necesario para usar, depurar o decidir profesionalmente
el tema— debe tener explicación causal, ejemplo específico, resultado observable,
al menos un límite o error y una práctica de transferencia. Los subtemas de apoyo
pueden compartir el ejemplo del tema si se identifica exactamente qué parte los
demuestra. Una mención, tabla de nombres o bloque de código sin explicación no
acredita profundidad. Si varios subtemas requieren objetivos o evidencias distintas,
divídelos en temas separados en vez de producir una lección enciclopédica.

Reporta por separado cobertura del tema y cobertura de sus subtemas críticos. Las
auditorías automáticas sólo generan candidatos para revisión humana; no pueden
inferir por sí solas que la descomposición semántica esté completa.

La profundidad demostrada en el tema de lambdas es el nivel mínimo para **cada
tema de cada track**, no una excepción reservada a Java. Antes de editar un tema:

1. identifica todos los conocimientos que el tema presupone;
2. inserta antes un tema completo cuando un prerrequisito importante sólo esté
   mencionado o aparezca por primera vez dentro de una API más avanzada;
3. descompone el tema en sus mecanismos, variantes, interacciones, errores,
   límites, rendimiento, seguridad y usos profesionales pertinentes;
4. adapta el mapa al dominio real: no copies los subtemas de lambdas a temas que
   necesiten otro desglose;
5. conserva el orden prerrequisito → fundamento → aplicación → integración →
   diagnóstico → decisión profesional.

Ejemplo normativo de secuenciación: antes de enseñar interfaces funcionales o
Streams en Java, debe existir un tema completo de lambdas que cubra sintaxis, SAM,
target typing, captura, `this`, referencias a métodos, sobrecargas ambiguas,
excepciones checked y especializaciones primitivas. Para otro tema se exige el
mismo grado de análisis, pero con sus propios subtemas esenciales.

Esta regla es una **puerta de calidad obligatoria**. No declares terminado,
publicable, revisado o profesional un tema hasta registrar y comprobar todos sus
subtemas críticos. Todo tema nuevo debe entrar con revisión humana de profundidad;
la deuda pendiente nunca puede aumentar. Una tabla de subtemas sin sus
explicaciones individuales tampoco supera la puerta.

Mantén separados: revisión estructural de todos los temas, ejecución de ejemplos,
pruebas de navegador y revisión pedagógica humana. Reporta cobertura y pendientes
sin presentar detección de marcadores como formación completa o certificación.

## Verificación

Al cambiar contenido, metadatos o estructura, regenera los índices y reportes
afectados y ejecuta `./scripts/validate.sh`. Al cambiar la aplicación, ejecuta
build y las pruebas relevantes desde `web/`. Para el Chrome instalado puede usarse
`PLAYWRIGHT_CHANNEL=chrome npm run e2e`; documenta cualquier cierre incompleto.
Las referencias a librerías y versiones se contrastan con documentación primaria.
