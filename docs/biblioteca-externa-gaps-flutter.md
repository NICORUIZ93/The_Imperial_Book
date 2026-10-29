# Huecos del track Flutter frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M11 T4** (entornos y flavors), **M0 T4** (lints), **M8 T5** (CustomPainter) y **M4 T5** (inyección de dependencias). ⚠️ **No ejecutado**: no había SDK de Flutter en el entorno. Ejecuta `flutter test` / `dart analyze` en cada ejemplo.

**Fecha:** 2026-10-28 · **Método:** outline del PDF cruzado con `flutter` + palabras clave.

## Libro cotejado
- **Ingenieria_de_Flutter.pdf** (comunidad Flutter en Español, 5 partes: fundamentos, arquitectura, procesos, ingeniería ética, UI avanzada).

## Huecos

| Tema del libro | Parte | Estado en el track | Prioridad |
|---|---|---|---|
| **Environments y flavors** (dev/qa/prod, `--dart-define`, flavors nativos) | III | 1 mención | **Alta**: imprescindible para publicar |
| **Normas de estilo y lints** (`analysis_options.yaml`, `flutter_lints`) | III | 0 menciones | **Alta** |
| **Inyección de dependencias** (get_it, Riverpod como DI) | II | 1 mención | Media |
| **Custom Painters y Shaders** | V | CustomPaint 1, shaders 0 | Media |
| **Criptografía y privacidad del usuario** | IV | 1 mención | Media (M13 trata secretos) |
| **Documentación del código** (dartdoc) | III | Sin tema | Baja |

## Propuesta
1. Tema nuevo en M11: "Flavors y entornos con `--dart-define`".
2. Tema nuevo en M0 o M9: "Lints y estilo con `analysis_options.yaml`".
3. Tema nuevo en M8: "CustomPainter y fragment shaders".
4. Tema nuevo en M4 o M12: "Inyección de dependencias en Flutter".
