# Laboratorios de transferencia profesional

Estos archivos coinciden con los bloques completos de las lecciones indicadas en `manifest.json`. La guía de preparación, comandos, fallo deliberado y práctica independiente vive en cada lección; copiar un fragmento sin preparar su proyecto no sustituye esos pasos.

`python3 scripts/verify_professional_bridges.py` comprueba igualdad entre archivos y Markdown, sin afirmar ejecución. La evidencia técnica por laboratorio se registra en `verification.json`.

Las pruebas se hicieron en macOS. Android queda pendiente. La comprobación de Kotlin fue JVM mediante Maven, no todos los destinos KMP. La prueba Flutter reconstruye/restaura el framework, no un proceso Android real. Ninguna ejecución acredita por sí sola revisión pedagógica con principiantes.
