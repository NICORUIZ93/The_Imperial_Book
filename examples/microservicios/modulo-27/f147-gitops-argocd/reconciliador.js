// Módulo 23 · F147 · Un reconciliador GitOps en miniatura: el mismo bucle que Argo CD, sin Kubernetes.
// «Deseado» = los YAML de una carpeta en un commit de Git. «Vivo» = un mapa en memoria que hace de clúster.
// Reglas copiadas de la documentación de Argo CD (Automated Sync Policy, consultada el 2026-11-20):
//  - solo sincroniza si la aplicación está OutOfSync;
//  - un intento automático por commit; con selfHeal también corrige la deriva del clúster en el mismo commit;
//  - sin prune, lo que desaparece de Git se queda en el clúster (y la app sigue OutOfSync).
// Como Argo CD, solo compara los campos que están en Git: lo que el clúster añade (p. ej. replicas que gestiona un
// HPA y no están en Git) no cuenta como diferencia. Aplicar = fusionar lo de Git sobre lo vivo (como kubectl apply).
// Requisitos: Node.js 26.13.1 LTS, git y yaml 2.9.1.
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
export const clave = (o) => `${o.kind}/${o.metadata.namespace ?? '-'}/${o.metadata.name}`;

/** Lee los objetos de `ruta` en la revisión `rev` del repositorio (como hace el repo-server de Argo CD). */
export function deseado(repo, rev, ruta) {
  const sha = git(repo, 'rev-parse', rev);
  const archivos = git(repo, 'ls-tree', '--name-only', `${sha}:${ruta}`).split('\n').filter((f) => /\.ya?ml$/.test(f));
  const objetos = new Map();
  for (const f of archivos) {
    for (const d of parseAllDocuments(git(repo, 'show', `${sha}:${ruta}/${f}`))) {
      const o = d.toJS();
      if (o) objetos.set(clave(o), o);
    }
  }
  return { sha, objetos };
}

/** ¿Todo lo que dice Git está igual en el objeto vivo? (los campos extra del vivo se ignoran) */
export function contiene(deseado, vivo) {
  if (Array.isArray(deseado)) return Array.isArray(vivo) && deseado.length === vivo.length && deseado.every((d, i) => contiene(d, vivo[i]));
  if (deseado && typeof deseado === 'object') return Boolean(vivo) && typeof vivo === 'object' && Object.keys(deseado).every((k) => contiene(deseado[k], vivo[k]));
  return deseado === vivo;
}

/** Fusiona lo deseado sobre lo vivo: los objetos se mezclan, las listas y los valores se reemplazan. */
export function aplicar(deseado, vivo) {
  if (!deseado || typeof deseado !== 'object' || Array.isArray(deseado) || !vivo || typeof vivo !== 'object') return structuredClone(deseado);
  const res = { ...vivo };
  for (const k of Object.keys(deseado)) res[k] = aplicar(deseado[k], vivo[k]);
  return res;
}

export function comparar(deseados, vivo) {
  const crear = [], cambiar = [], sobrantes = [];
  for (const [k, o] of deseados) {
    if (!vivo.has(k)) crear.push(k);
    else if (!contiene(o, vivo.get(k))) cambiar.push(k);
  }
  for (const k of vivo.keys()) if (!deseados.has(k)) sobrantes.push(k);
  return { crear, cambiar, sobrantes };
}

export class Aplicacion {
  constructor({ repo, rama = 'main', ruta = 'k8s', prune = false, selfHeal = false }) {
    Object.assign(this, { repo, rama, ruta, prune, selfHeal });
    this.vivo = new Map();          // el «clúster»
    this.ultimoIntento = null;      // commit del último sync automático
  }

  /** Un ciclo de reconciliación: compara, decide y (si toca) sincroniza. Devuelve lo que pasó. */
  reconciliar() {
    const { sha, objetos } = deseado(this.repo, this.rama, this.ruta);
    const dif = comparar(objetos, this.vivo);
    const pendientes = dif.crear.length + dif.cambiar.length + dif.sobrantes.length;
    if (pendientes === 0) return { sha, estado: 'Synced', accion: 'nada' };
    const commitNuevo = this.ultimoIntento !== sha;
    if (!commitNuevo && !this.selfHeal) return { sha, estado: 'OutOfSync', accion: 'espera (mismo commit, sin selfHeal)', dif };
    for (const k of [...dif.crear, ...dif.cambiar]) this.vivo.set(k, aplicar(objetos.get(k), this.vivo.get(k)));
    if (this.prune) for (const k of dif.sobrantes) this.vivo.delete(k);
    this.ultimoIntento = sha;
    const quedan = comparar(objetos, this.vivo);
    const estado = quedan.crear.length + quedan.cambiar.length + quedan.sobrantes.length ? 'OutOfSync' : 'Synced';
    return { sha, estado, accion: 'sync', dif };
  }
}
