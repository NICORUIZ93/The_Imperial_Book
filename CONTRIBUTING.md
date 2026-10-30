# Contribuir a The Imperial Book

Gracias por ayudar a mejorar la academia. Mantén el alcance de cada cambio claro
y respeta las licencias y atribuciones de los materiales que aportes.

## Idioma y commits

- La prosa de las lecciones, guías y documentación para estudiantes se escribe
  en español. Conserva en inglés los identificadores, nombres oficiales de APIs
  y términos técnicos cuando traducirlos genere ambigüedad.
- Usa Conventional Commits con asunto en inglés y una sola intención por
  commit: `type(scope): concise description`, por ejemplo
  `docs(curriculum): clarify the Java learning path`.
- Prefiere tipos como `feat`, `fix`, `docs`, `test`, `refactor` y `chore`.

## Antes de abrir un cambio

1. Lee `docs/editorial-contract.md` y el estándar de código aplicable.
2. Para lecciones, edita el Markdown del track y conserva la paridad entre
   `web/src/app/tracks/` y `web/public/content/<track>/`.
3. Usa ejemplos originales o compatibles con su licencia; enlaza fuentes
   oficiales y no copies ejercicios, prosa o diagramas de libros.
4. Ejecuta las comprobaciones relevantes:

   ```bash
   ./scripts/validate.sh
   cd web && npm test -- --watch=false --coverage
   cd web && npm run build --silent
   ```

5. Describe el problema, el comportamiento esperado, cómo lo verificaste y las
   limitaciones restantes en el pull request.

## Licencias

El código y las herramientas están bajo MIT; el contenido editorial original,
bajo CC BY 4.0. Consulta `LICENSE` y
`web/public/content/LICENCIA-CONTENIDO.md`. Al contribuir, confirma que tienes
derecho a compartir el material y añade la atribución/licencia requerida. No
incluyas credenciales, datos personales ni archivos locales generados.
