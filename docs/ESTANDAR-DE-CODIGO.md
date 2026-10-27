# Estándar transversal de código y diseño

Todo ejemplo de The Imperial Book debe enseñar simultáneamente el concepto técnico y una forma profesional de expresarlo. El código corto no está exento de calidad, pero tampoco debe llenarse de abstracciones que oculten la idea principal.

## Prioridades

1. **Corrección:** preserva reglas del dominio y maneja casos normales, límite y de error.
2. **Claridad:** nombres específicos expresan intención y unidades; el flujo puede explicarse sin descifrarlo.
3. **Cohesión:** cada función, clase, módulo, consulta o recurso resuelve una responsabilidad reconocible.
4. **Dependencias visibles:** entradas, tiempo, red, archivos, base de datos y servicios externos no aparecen como magia global.
5. **Errores explícitos:** no se ocultan excepciones, rechazos ni resultados parciales; se agrega contexto sin filtrar secretos.
6. **Verificación:** una prueba, medición o comando reproducible demuestra el comportamiento.
7. **Simplicidad:** no se crea una interfaz, patrón o capa sin una necesidad concreta de cambio, sustitución, aislamiento o prueba.

## Clean Code con criterio

- Prefiere nombres como `calcularTarifa(pesoKg, distanciaKm)` frente a `procesar(a, b)`.
- Mantén juntas las líneas que sostienen una misma regla y separa decisiones independientes.
- Extrae una función cuando permite nombrar una intención, reutilizar una regla o probarla aisladamente; no por cumplir un límite arbitrario de líneas.
- Sustituye comentarios que narran la sintaxis por nombres y estructura; conserva comentarios que explican restricciones, decisiones o motivos no evidentes.
- Evita booleanos ambiguos, números sin unidad, estado global mutable y duplicación de reglas del negocio.
- Favorece retornos tempranos cuando reducen anidación y conserva una única representación autorizada de cada invariante.

## SOLID cuando aporta valor

- **Responsabilidad única:** agrupa por una razón coherente de cambio; no significa una clase por operación.
- **Abierto/cerrado:** añade estrategias o reglas configurables cuando existen variantes reales; no anticipa extensiones imaginarias.
- **Sustitución de Liskov:** una implementación cumple el contrato completo sin reforzar precondiciones ni sorprender al consumidor.
- **Segregación de interfaces:** cada consumidor depende de las capacidades que utiliza; evita interfaces generales con métodos vacíos.
- **Inversión de dependencias:** el dominio depende de contratos en fronteras que necesitan sustitución, prueba o aislamiento, no de detalles de red, base de datos o framework.

## Más allá del código orientado a objetos

Los mismos principios se aplican a otros artefactos:

- una función pura puede tener una responsabilidad clara sin convertirse en clase;
- un componente de interfaz separa presentación, estado y efectos según su complejidad;
- una consulta SQL expresa intención, usa parámetros y conserva integridad;
- un módulo Terraform tiene entradas, salidas, alcance y ownership definidos;
- un pipeline separa verificación, construcción, promoción y despliegue;
- un manifiesto o configuración incluye valores seguros, validación y explicación de decisiones.

## Revisión obligatoria de cada ejemplo

Antes de publicar o completar un capítulo, responde:

1. ¿Los nombres explican intención, dominio y unidades?
2. ¿Existe una sola fuente para cada regla importante?
3. ¿Los efectos y dependencias son visibles y sustituibles cuando hace falta?
4. ¿Los errores agregan contexto y conservan la causa?
5. ¿La solución más simple satisface los requisitos actuales?
6. ¿Una prueba o medición demuestra el resultado?
7. ¿Cada abstracción paga su complejidad con una necesidad real?

La rúbrica penaliza tanto el código confuso como la sobreingeniería. El objetivo no es “usar SOLID” nominalmente, sino producir software que otra persona pueda comprender, cambiar, comprobar y operar con seguridad.
