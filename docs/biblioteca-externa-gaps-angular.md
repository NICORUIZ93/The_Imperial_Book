# Huecos del track Angular frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M1 T7** (pipes puros e impuros, AsyncPipe y signals) y **M10 T4** (Angular Material, CDK y harnesses). Verificado con Angular 22 y `ng test`.

**Fecha:** 2026-10-28 · **Método:** índice textual del PDF (100 lecciones) cruzado con `angular` + palabras clave.

## Libro cotejado
- **Programacion_Angular_Framework_Libro_Avanzado.pdf** ("El gran libro de Angular", 456 págs.). Es de la era NgModules (Angular 2-8).

## Veredicto
El track es **más moderno que el libro** (signals, standalone, zoneless, `@defer`, SSR). La mayoría del libro está superado. Huecos reales:

| Tema del libro | Lección | Estado en el track | Prioridad |
|---|---|---|---|
| **Pipes puros vs impuros y `AsyncPipe`** | 034-035 | "impuro" 0 menciones; `async` pipe 1 | Media |
| **UI kit de componentes** (el libro usa Bootstrap; hoy Angular Material/CDK) | 087-100 | Angular Material 0 menciones | Media: casi todo proyecto real usa un kit |
| **MEAN de punta a punta** (Angular + Express + Mongo en un solo proyecto) | 070-078 | Separado entre `angular` y `node` | Baja: se cubre por integración entre tracks |

## Fuera de alcance
NgModules, `*ngIf/*ngFor`, jQuery: obsoletos; el track enseña su reemplazo (M0 T1, M1 T2, M8).

## Propuesta
1. Ampliar M1 T6 con pipes puros/impuros y `AsyncPipe` frente a signals.
2. Tema nuevo en M10 o M14: "Angular Material y CDK con accesibilidad".
