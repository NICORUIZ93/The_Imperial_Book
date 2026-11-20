// Módulo 23 · F147 · Demostración del bucle GitOps: commit -> sync, cambio a mano -> selfHeal, borrar -> prune,
// git revert -> rollback. Crea un repositorio Git temporal con una copia de k8s/. Ejecuta: node f147-gitops-argocd/demo.js
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Aplicacion } from './reconciliador.js';

const repo = mkdtempSync(join(tmpdir(), 'tienda-gitops-'));
const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=Estudiante', '-c', 'user.email=estudiante@ejemplo.dev', ...a], { encoding: 'utf8' }).trim();
git('init', '-q', '-b', 'main');
cpSync('k8s', join(repo, 'k8s'), { recursive: true });
git('add', '.'); git('commit', '-q', '-m', 'pedidos 1.0.0');

const app = new Aplicacion({ repo, prune: true, selfHeal: true });
const ver = (titulo) => {
  const r = app.reconciliar();
  const d = r.dif ? ` crear=${r.dif.crear.length} cambiar=${r.dif.cambiar.length} sobrantes=${r.dif.sobrantes.length}` : '';
  console.log(`${titulo.padEnd(44)} commit ${r.sha.slice(0, 7)} -> ${r.accion}${d} -> ${r.estado}`);
};
const imagen = () => app.vivo.get('Deployment/tienda/pedidos').spec.template.spec.containers[0].image;

ver('1. primer ciclo (clúster vacío)');
ver('2. siguiente ciclo, sin cambios');
app.vivo.get('Deployment/tienda/pedidos').spec.template.spec.containers[0].image = 'pedidos:parche-urgente';
console.log(`   (a mano: kubectl set image -> imagen viva = ${imagen()})`);
ver('3. ciclo tras el cambio a mano');
console.log(`   imagen viva = ${imagen()} (selfHeal devolvió lo que dice Git)`);

const dep = join(repo, 'k8s/20-deployment.yaml');
writeFileSync(dep, readFileSync(dep, 'utf8').replace('image: pedidos:1.0.0', 'image: pedidos:1.1.0'));
git('commit', '-q', '-am', 'pedidos 1.1.0');
ver('4. commit «pedidos 1.1.0»');
console.log(`   imagen viva = ${imagen()}`);

git('rm', '-q', 'k8s/40-hpa.yaml'); git('commit', '-q', '-m', 'quito el HPA');
ver('5. commit que borra el HPA (prune: true)');
console.log(`   ¿HPA en el clúster? ${app.vivo.has('HorizontalPodAutoscaler/tienda/pedidos') ? 'sí' : 'no'}`);

git('revert', '--no-edit', 'HEAD~1');
ver('6. git revert del commit 1.1.0 (rollback)');
console.log(`   imagen viva = ${imagen()} · historial: ${git('log', '--format=%s', '-4').split('\n').join(' | ')}`);
rmSync(repo, { recursive: true, force: true });
