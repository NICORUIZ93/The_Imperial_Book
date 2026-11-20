// Módulo 23 · F143 · Validador de manifiestos SIN clúster: lee los YAML y comprueba lo que suele romper un despliegue.
// Requisitos: Node.js 26.13.1 LTS y yaml 2.9.1. Uso: node f143-kubernetes/validar.js k8s/ [otro.yaml…]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseAllDocuments } from 'yaml';

export function cargar(rutas) {
  const archivos = rutas.flatMap((r) => (statSync(r).isDirectory() ? readdirSync(r).filter((f) => /\.ya?ml$/.test(f)).sort().map((f) => join(r, f)) : [r]));
  return archivos.flatMap((a) => parseAllDocuments(readFileSync(a, 'utf8')).map((d) => d.toJS()).filter(Boolean));
}

const coincide = (selector, etiquetas) => Object.entries(selector ?? {}).every(([k, v]) => etiquetas?.[k] === v);

export function validar(objetos) {
  const problemas = [];
  const deployments = objetos.filter((o) => o.kind === 'Deployment');
  for (const d of deployments) {
    const id = `Deployment ${d.metadata.namespace}/${d.metadata.name}`;
    const plantilla = d.spec.template;
    if (!coincide(d.spec.selector?.matchLabels, plantilla.metadata?.labels)) problemas.push(`${id}: spec.selector no coincide con las etiquetas del pod`);
    if (d.spec.strategy?.rollingUpdate?.maxUnavailable !== 0) problemas.push(`${id}: maxUnavailable debería ser 0 para no perder capacidad al desplegar`);
    if (plantilla.spec.securityContext?.runAsNonRoot !== true) problemas.push(`${id}: falta runAsNonRoot: true`);
    for (const c of plantilla.spec.containers) {
      const cid = `${id} contenedor ${c.name}`;
      if (!/:[^:]+$/.test(c.image) || c.image.endsWith(':latest')) problemas.push(`${cid}: imagen sin versión fija (${c.image})`);
      if (!c.readinessProbe) problemas.push(`${cid}: sin readinessProbe (recibe tráfico antes de estar listo)`);
      if (!c.livenessProbe) problemas.push(`${cid}: sin livenessProbe (un proceso colgado nunca se reinicia)`);
      if (!c.resources?.requests?.cpu || !c.resources?.requests?.memory) problemas.push(`${cid}: sin requests de cpu y memoria (el HPA no puede calcular el uso)`);
      if (!c.resources?.limits?.memory) problemas.push(`${cid}: sin limits.memory`);
      if (c.livenessProbe && c.readinessProbe && c.livenessProbe.httpGet?.path === c.readinessProbe.httpGet?.path) {
        problemas.push(`${cid}: liveness y readiness usan la misma ruta (si una dependencia cae, reinicia todos los pods)`);
      }
    }
  }
  for (const s of objetos.filter((o) => o.kind === 'Service')) {
    const id = `Service ${s.metadata.namespace}/${s.metadata.name}`;
    const destino = deployments.find((d) => d.metadata.namespace === s.metadata.namespace && coincide(s.spec.selector, d.spec.template.metadata.labels));
    if (!destino) { problemas.push(`${id}: el selector ${JSON.stringify(s.spec.selector)} no elige ningún pod (Endpoints vacíos)`); continue; }
    const puertos = destino.spec.template.spec.containers.flatMap((c) => c.ports ?? []);
    for (const p of s.spec.ports) {
      const ok = typeof p.targetPort === 'number' ? puertos.some((x) => x.containerPort === p.targetPort) : puertos.some((x) => x.name === p.targetPort);
      if (!ok) problemas.push(`${id}: targetPort ${p.targetPort} no existe en el contenedor`);
    }
  }
  return problemas;
}

if (import.meta.main) {
  const objetos = cargar(process.argv.slice(2));
  console.log(`objetos: ${objetos.map((o) => `${o.kind}/${o.metadata.name}`).join(', ')}`);
  const problemas = validar(objetos);
  for (const p of problemas) console.log(`✘ ${p}`);
  console.log(problemas.length ? `${problemas.length} problemas` : '✔ sin problemas');
  process.exitCode = problemas.length ? 1 : 0;
}
