import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audit_lesson_substance import MAX_TAIL_WORDS, evaluate_topic


CLEAN = """### Tema 1: Un tema sin relleno

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ejecutar el ejemplo y explicar su salida.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un caso concreto con una consecuencia observable.

#### Paso 3 · Teoría, modelo mental y analogía

**Analogía:** una caja que guarda una etiqueta.

#### Paso 4 · Demostración guiada desde cero

```bash
node ejemplo.mjs
```

**Resultado esperado:** imprime `ok`.

#### Paso 5 · Práctica guiada

**Pista:** cambia el valor.

#### Paso 6 · Práctica independiente

Repite el ejercicio con otro valor.

#### Paso 7 · Cierre y evidencia

Siguiente paso: el siguiente tema. **Evidencia de aprendizaje:** entrega la salida.

**Errores comunes:** olvidar guardar.

**Fuente oficial:** https://example.com/docs
"""


LONG_PARAGRAPH = (
    "Este párrafo existe solo para que el tema supere el mínimo de palabras y "
    "represente una lección real. Explica el procedimiento con detalle, nombra "
    "los archivos, indica qué se observa y qué decisión toma quien estudia."
)
def filler(index: int) -> str:
    return (
        f"Párrafo {index}: este texto existe solo para que el tema supere el mínimo "
        "de palabras y represente una lección real. Explica el procedimiento con "
        "detalle, nombra los archivos, indica qué se observa y qué decisión toma "
        "quien estudia, sin repetir el mismo contenido en otro párrafo."
    )


BASE = CLEAN.replace(
    "#### Paso 7",
    "\n\n".join(filler(index) for index in range(12)) + "\n\n#### Paso 7",
)


class SubstanceAuditTests(unittest.TestCase):
    def test_clean_topic_has_no_issues(self):
        self.assertEqual(evaluate_topic(BASE)["issues"], [])

    def test_duplicated_section_is_flagged(self):
        block = BASE + "\n**¿Por qué es importante?** Repetido sin necesidad.\n"
        self.assertIn("bloque-repetido", evaluate_topic(block)["issues"])

    def test_legacy_tail_is_flagged(self):
        tail = " ".join(["relleno"] * (MAX_TAIL_WORDS + 50))
        block = BASE + "\n" + tail
        self.assertIn("cola-tras-cierre", evaluate_topic(block)["issues"])

    def test_generic_scaffold_is_flagged(self):
        block = BASE + "\n**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**.\n"
        self.assertIn("andamiaje-generico", evaluate_topic(block)["issues"])

    def test_missing_source_is_flagged(self):
        block = BASE.replace("**Fuente oficial:** https://example.com/docs", "")
        self.assertIn("sin-fuente", evaluate_topic(block)["issues"])

    def test_repeated_paragraph_is_flagged(self):
        block = BASE + "\n\n" + filler(1)
        self.assertIn("parrafo-repetido", evaluate_topic(block)["issues"])


if __name__ == "__main__":
    unittest.main()
