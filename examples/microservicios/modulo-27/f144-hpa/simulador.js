// Módulo 23 · F144 · Simulador del algoritmo del HorizontalPodAutoscaler (autoscaling/v2) para métricas de CPU.
// Reproduce lo que documenta kubernetes.io (Horizontal Pod Autoscaling, consultado el 2026-11-20):
//   deseadas = ceil(actuales × usoActual / usoObjetivo), sin cambios si el cociente está a menos de la tolerancia (0.1)
//   de 1.0; acotado a [minReplicas, maxReplicas]; para bajar usa la recomendación MÁS ALTA de la ventana de
//   estabilización; y las políticas limitan cuántos pods cambian por periodo. Simplificaciones: solo políticas de tipo
//   Pods y sin pods «no listos» ni métricas ausentes. Requisitos: Node.js 26.13.1 LTS y yaml 2.9.1.
// Ejecuta: node f144-hpa/simulador.js
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

/** Recomendación «cruda» del algoritmo (sin ventanas ni políticas). utilizacion = % medio de cpu.requests. */
export function recomendar(actuales, utilizacion, objetivo, tolerancia = 0.1) {
  if (utilizacion == null) return actuales;              // sin requests o sin métricas: el HPA no actúa
  const cociente = utilizacion / objetivo;
  if (Math.abs(cociente - 1) <= tolerancia) return actuales;
  return Math.ceil(actuales * cociente);
}

export class Hpa {
  constructor(spec, replicas) {
    this.spec = spec;
    this.replicas = replicas;
    this.historial = [{ t: 0, replicas }];   // réplicas aplicadas, para las políticas por periodo
    this.recomendaciones = [];               // {t, deseadas}, para la ventana de estabilización
  }

  paso(t, utilizacion) {
    const { minReplicas, maxReplicas, behavior } = this.spec;
    const objetivo = this.spec.metrics[0].resource.target.averageUtilization;
    let deseadas = Math.min(maxReplicas, Math.max(minReplicas, recomendar(this.replicas, utilizacion, objetivo)));
    this.recomendaciones.push({ t, deseadas });
    const enVentana = (seg) => this.recomendaciones.filter((r) => r.t > t - seg || r.t === t).map((r) => r.deseadas);
    if (deseadas < this.replicas) deseadas = Math.max(...enVentana(behavior.scaleDown.stabilizationWindowSeconds ?? 300));
    else if (deseadas > this.replicas) deseadas = Math.min(...enVentana(behavior.scaleUp.stabilizationWindowSeconds ?? 0));
    const base = (seg) => [...this.historial].reverse().find((h) => h.t <= t - seg)?.replicas ?? this.historial[0].replicas;
    if (deseadas > this.replicas) {
      const p = behavior.scaleUp.policies.find((x) => x.type === 'Pods');
      if (p) deseadas = Math.min(deseadas, base(p.periodSeconds) + p.value);
    } else if (deseadas < this.replicas) {
      const p = behavior.scaleDown.policies.find((x) => x.type === 'Pods');
      if (p) deseadas = Math.max(deseadas, base(p.periodSeconds) - p.value);
    }
    if (deseadas !== this.replicas) this.historial.push({ t, replicas: deseadas });
    this.replicas = deseadas;
    return deseadas;
  }
}

export function cargarSpec(ruta = 'k8s/40-hpa.yaml') {
  return parse(readFileSync(ruta, 'utf8')).spec;
}

if (import.meta.main) {
  // Demanda total de CPU en milicores: tranquila, un pico de 4 minutos y otra vez tranquila. Cada pod pide 100m.
  const demanda = (t) => (t >= 120 && t < 360 ? 900 : 150);
  const hpa = new Hpa(cargarSpec(), 3);
  console.log('   t   demanda  uso/pod  réplicas');
  for (let t = 0; t <= 900; t += 15) {          // el controlador evalúa cada 15 s
    const uso = Math.round(demanda(t) / (hpa.replicas * 100) * 100);
    const antes = hpa.replicas;
    const despues = hpa.paso(t, uso);
    if (despues !== antes || t % 120 === 0) console.log(`${String(t).padStart(4)}s ${String(demanda(t)).padStart(6)}m ${String(uso).padStart(6)} %   ${antes} -> ${despues}`);
  }
}
