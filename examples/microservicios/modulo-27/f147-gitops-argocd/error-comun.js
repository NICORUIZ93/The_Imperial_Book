// Módulo 23 · F147 · ERROR COMÚN: «replicas» fijado en Git + HPA + selfHeal. El HPA sube a 7 pods por la carga y Argo CD
// los devuelve a 3 en cada ciclo: los dos controladores se pelean y los pods nacen y mueren sin parar.
// Ejecuta: node f147-gitops-argocd/error-comun.js
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Aplicacion } from './reconciliador.js';

function escenario(titulo, conReplicas) {
  const repo = mkdtempSync(join(tmpdir(), 'pelea-hpa-'));
  const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=E', '-c', 'user.email=e@ejemplo.dev', ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  cpSync('k8s', join(repo, 'k8s'), { recursive: true });
  const dep = join(repo, 'k8s/20-deployment.yaml');
  if (conReplicas) writeFileSync(dep, readFileSync(dep, 'utf8').replace('  revisionHistoryLimit: 5', '  replicas: 3\n  revisionHistoryLimit: 5'));
  git('add', '.'); git('commit', '-q', '-m', 'inicial');
  const app = new Aplicacion({ repo, prune: true, selfHeal: true });
  app.reconciliar();
  const serie = [];
  for (let ciclo = 0; ciclo < 4; ciclo++) {
    app.vivo.get('Deployment/tienda/pedidos').spec.replicas = 7;   // el HPA escala por la carga
    const r = app.reconciliar();                                   // y Argo CD reconcilia
    serie.push(`${r.accion === 'sync' ? 'sync' : 'nada'}→${app.vivo.get('Deployment/tienda/pedidos').spec.replicas}`);
  }
  console.log(`${titulo}: ${serie.join('  ')}`);
  rmSync(repo, { recursive: true, force: true });
}
escenario('MAL  replicas: 3 en Git', true);
escenario('BIEN sin replicas en Git', false);
