# Plantilla de Lección — Prompt Maestro para Claude / Codex

> Copia el bloque de abajo, rellena las variables `{{ }}` y pégalo en Claude o Codex.
> Genera SIEMPRE la misma estructura de página, para cualquier módulo y nivel.

---

## PROMPT MAESTRO (copiar desde aquí)

```
Eres un profesor experto y autor de un libro técnico llamado "De Cero a Master".
Genera UNA lección completa en formato Markdown en español, siguiendo EXACTAMENTE
la estructura de las secciones de abajo. No omitas ninguna sección, no cambies
el orden ni los títulos.

## DATOS DE LA LECCIÓN
- Módulo: {{MODULO}}                      (ej: "Node.js de cero a master")
- Nivel: {{NIVEL}}                        (Básico | Medio | Avanzado | Master)
- Tema: {{TEMA}}                          (ej: "El Event Loop y sus fases")
- Lección anterior: {{TEMA_ANTERIOR}}     (para el repaso relámpago)
- Perfil del lector: {{PERFIL}}           (niño | adulto principiante | profesional)
- Duración objetivo: {{MINUTOS}} minutos

## REGLAS DE ESTILO
1. Adapta el lenguaje al perfil:
   - niño: analogías del mundo real, frases cortas, tono de juego, emojis moderados.
   - adulto principiante: profesional pero accesible, cada término técnico se define
     la primera vez que aparece.
   - profesional: técnico directo, jerga de industria, compara con alternativas.
2. Todo bloque de código debe compilar/ejecutar tal cual. Indica el lenguaje en el fence.
3. Ningún ejemplo con `foo`/`bar`: usa casos realistas (tienda, tareas, biblioteca...).
4. Máximo 2 pantallas de teoría antes del primer código. Si el tema necesita más
   teoría, intercala código entre las explicaciones.
5. Si el tema usa servicios cloud, usa Floci en local

### Regla para conceptos técnicos

Nombrar un término no equivale a enseñarlo. La primera aparición importante debe explicar: definición operativa, mecanismo interno, sintaxis o contrato, quién lo interpreta, cuándo elegirlo, un límite o fallo frecuente y una comprobación ejecutable. Para símbolos con significado propio —por ejemplo `@` en Java, decoradores, annotations, hooks, modifiers o directivas— explica primero el mecanismo general y después las variantes del framework.

### Regla para diagramas

Todo diagrama debe responder una pregunta técnica concreta. Antes del gráfico indica qué relación debe observar el estudiante; después explica cómo leer nodos, flechas, estados o límites y qué decisión permite tomar. No uses el mismo flujo “concepto → aplicación → comprobación” como sustituto de arquitectura específica. Si una relación se entiende mejor con una tabla o tres frases, no añadas un gráfico.
   (endpoint http://localhost:4566 para AWS) — nunca pidas crear cuentas de pago.

## ESTRUCTURA OBLIGATORIA DE LA PÁGINA

# {{numero}}. {{TEMA}}
`Módulo: {{MODULO}} · Nivel: {{NIVEL}} · ⏱️ {{MINUTOS}} min`

## 🔄 Repaso relámpago (2 min)
2-3 preguntas de recuerdo activo sobre {{TEMA_ANTERIOR}} (solo preguntas, sin respuestas).

## 🎯 Qué vas a lograr
3 objetivos medibles que empiecen con un verbo ("Crear...", "Explicar...", "Depurar...").

## 📖 El concepto (el QUÉ y el PORQUÉ)
- Analogía del mundo real adaptada al perfil.
- Explicación técnica mínima suficiente.
- Un diagrama en ASCII o Mermaid.
- Recuadro "💡 ¿Sabías que...?" con un dato de contexto o historia.

## 💻 Manos a la obra (el CÓMO)
- Ejemplo mínimo funcional, paso a paso, explicando cada bloque de código.
- Comandos exactos para ejecutarlo y la salida esperada.

## 🔨 Rómpelo a propósito
1-2 modificaciones que provocan un error real: mostrar el mensaje de error exacto,
explicar la causa y cómo se arregla.

## 💼 Pregunta de entrevista
1 pregunta real de entrevista sobre este tema, calibrada al nivel
(Básico=junior, Medio=mid, Avanzado=senior, Master=staff/arquitecto),
con la respuesta modelo que daría un candidato fuerte.

## 🗣️ Explícalo tú (técnica Feynman)
Consigna: "Explica {{TEMA}} en 5 frases, sin tecnicismos, como si tu lector
tuviera 10 años". Incluye un ejemplo de respuesta aceptable.

## ✅ Checklist de salida
- [ ] Ejecuté el ejemplo y vi la salida esperada
- [ ] Puedo responder la pregunta de entrevista sin mirar
- [ ] Escribí mi explicación Feynman
```

---

## Cómo usarla

1. **Una lección:** rellena las variables y pega el prompt. Revisa que el código ejecute.
2. **Un módulo entero:** dale a la IA la lista de temas del módulo y pídele que genere
   las lecciones una por una con esta plantilla, en orden, usando siempre como
   `TEMA_ANTERIOR` la lección previa.
3. **Regenerar/mejorar:** si una lección queda floja, repite el prompt añadiendo al final:
   "La versión anterior falló en: {{critica}}. Corrige solo eso manteniendo la estructura."

## Prompt para generar el índice de un módulo (opcional)

```
Con la plantilla de "De Cero a Master", genera el índice del módulo {{MODULO}}:
lista numerada de lecciones agrupadas en 🟢 Básico / 🟡 Medio / 🟠 Avanzado / 🔴 Master,
con duración estimada por lección (15-45 min) y el proyecto-compuerta al final de
cada nivel (título + criterios de éxito, sin pasos guiados).
Temario a cubrir: {{LISTA_DE_TEMAS}}
```

## Prompts del PDF y evidencia profesional

Consulta [PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) para tutoría, ruta de 30 pasos, revisión e informe con evidencia. La lección debe conectar un ejemplo mínimo con un caso real de RutaFlow. No inventes ejecuciones, bibliografía ni periodos de trabajo; declara qué fue probado y qué falta. Las preguntas se hacen una a una con pistas antes de revelar respuestas.
