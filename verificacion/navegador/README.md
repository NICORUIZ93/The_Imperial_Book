# Barrido con navegador

Recorre las páginas de módulo con Playwright (Chromium) y comprueba temas, diagramas Mermaid, control de
progreso, consola y enlaces internos. Con la app corriendo (`cd web && npm start`):

```bash
node verificacion/navegador/sweep_topics.cjs --base-url=http://127.0.0.1:4200 --concurrency=2 --out=verificacion/navegador/flow.json
```

Con concurrencia 6 aparecen falsos errores de «0 temas» por páginas que tardan en cargar; usa 2.
