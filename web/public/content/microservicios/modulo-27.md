# Módulo 27 · Gobernanza, operación y evolución experta en Node

El último módulo antes del capstone consolidado convierte la técnica en operación sostenible: SLOs, runbooks, postmortems, FinOps, seguridad de supply chain, evolución de contratos y madurez de equipo. El objetivo es que el sistema siga siendo cambiable y confiable después del lanzamiento.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Se ejecutan checks de SLO, políticas, compatibilidad de contratos y checklists operativas. Herramientas externas (PagerDuty, ArgoCD, Snyk, cloud billing) se tratan con **Nota de verificación**.

## Aprende construyendo

### Tema 1: SLO, alertas y runbooks · Avanzado · 120 min

Caso guía: definir cuándo llamar a alguien a las 3 AM.

#### SLI/SLO/alerta

**Definición formal.** SLI es un indicador medido (latencia, error rate). SLO es el objetivo sobre ese indicador. Las alertas deben dispararse por síntomas que amenazan el SLO o experiencia de usuario, no por ruido.

**Para qué sirve.** Operar con prioridades claras.

**Cuándo usarlo / cuándo no.** Úsalo en servicios productivos. No alertes por todo; no confundas causa interna con síntoma usuario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm15-slo
cd nm15-slo
```

Crea el archivo `slo.mjs`:

```js
function evaluate({ p99Ms, errorRate }) {
  return { p99Ok: p99Ms <= 300, errorsOk: errorRate <= 0.01, page: p99Ms > 300 || errorRate > 0.01 };
}
console.log(evaluate({ p99Ms: 250, errorRate: 0.005 }).page);
console.log(evaluate({ p99Ms: 450, errorRate: 0.005 }).page);
```

```bash
node slo.mjs
```

**Caso de uso real.** Prometheus alerting rules + runbook link.

**Error común.** Alertar por CPU alta sin impacto.

**Síntoma.** fatiga de alertas. **Causa.** alertas por causa, no síntoma. **Corrección.** alertas basadas en SLO/síntoma. **Señal observable.** muchas páginas ignoradas.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `false`, `true`.

### Tema 2: Postmortems y mejora continua · Intermedio · 90 min

Caso guía: outage por retry storm.

#### Postmortem blameless

**Definición formal.** Un postmortem blameless documenta incidente, impacto, línea de tiempo, causa raíz sistémica, acciones correctivas y dueños.

**Para qué sirve.** Aprender y evitar repetición.

**Cuándo usarlo / cuándo no.** Úsalo tras incidentes relevantes o near misses. No busques culpables individuales; busca fallas del sistema.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm15-pm
cd nm15-pm
```

Crea el archivo `postmortem.mjs`:

```js
const pm = { incident: 'retry-storm', impact: '5xx 12%', root: 'missing jitter', actions: ['add jitter', 'cap retries'] };
console.log(pm.actions.length);
console.log(pm.root.includes('jitter'));
```

```bash
node postmortem.mjs
```

**Caso de uso real.** Documento postmortem con acción verificable en backlog.

**Error común.** “Error humano” como causa final.

**Síntoma.** incidentes repetidos. **Causa.** no corregir sistema. **Corrección.** guardrails, automatización, tests, límites. **Señal observable.** misma clase de incidente reaparece.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2`, `true`.

### Tema 3: FinOps, supply chain y hardening operativo · Avanzado · 120 min

Caso guía: observabilidad cuesta más que el servicio.

#### Costo y cadena de suministro

**Definición formal.** FinOps gestiona costo cloud con visibilidad y accountability. Supply chain security protege dependencias, imágenes y pipeline (SBOM, scanning, pinning).

**Para qué sirve.** Evitar sorpresas de costo y vulnerabilidades.

**Cuándo usarlo / cuándo no.** Siempre en producción. No ignores CVEs críticas ni crecimiento de cardinalidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm15-finops
cd nm15-finops
```

Crea el archivo `checks.mjs`:

```js
const image = { pinned: true, sbom: true, criticalCves: 0 };
const obs = { series: 12000, budget: 10000 };
console.log(image.pinned && image.sbom && image.criticalCves === 0);
console.log(obs.series <= obs.budget);
```

```bash
node checks.mjs
```

**Caso de uso real.** Snyk/Trivy, SBOM, budgets, alertas de costo.

**Error común.** Tags flotantes e imágenes sin escaneo.

**Síntoma.** builds no reproducibles o CVEs. **Causa.** falta de pinning/scanning. **Corrección.** digests pinneados, SBOM, scan en CI. **Señal observable.** imagen cambia sin cambio de código.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** scanners reales no ejecutados.

### Tema 4: Evolución de contratos y deprecación · Avanzado · 120 min

Caso guía: retirar campo `status` v1 sin romper consumidores.

#### Compatibilidad y deprecación

**Definición formal.** Evolucionar contratos implica cambios compatibles, versionado, periodo de deprecación, telemetría de uso y retiro controlado.

**Para qué sirve.** Cambiar el sistema sin romper clientes.

**Cuándo usarlo / cuándo no.** Siempre que haya múltiples consumidores. No retires campos sin ventana y observabilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm15-evolve
cd nm15-evolve
```

Crea el archivo `compat.mjs`:

```js
function v1(order) { return { id: order.id, status: order.state }; }
function v2(order) { return { id: order.id, state: order.state }; }
const order = { id: 'o1', state: 'paid' };
console.log(v1(order).status === 'paid');
console.log(v2(order).state === 'paid');
```

```bash
node compat.mjs
```

**Caso de uso real.** Deprecation header, métricas por versión, fecha de retiro.

**Error común.** Breaking change sin versión.

**Síntoma.** consumidores fallan al desplegar. **Causa.** contrato roto. **Corrección.** additive changes, dual-write/read, deprecation window. **Señal observable.** errores de schema en clientes antiguos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`.

## Cierre

La madurez experta no es solo diseñar microservicios: es operarlos, costearlos, asegurarlos, evolucionarlos y aprender de incidentes. Sin esta capa, el sistema decae tras el primer release.

## Checklist

- SLOs con alertas por síntoma y runbooks.
- Postmortems blameless con acciones.
- Costos y supply chain visibles en CI.
- Contratos evolucionados con deprecación.
- Evidencia operativa antes de escalar.
