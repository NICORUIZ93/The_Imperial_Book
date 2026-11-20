// Módulo 23 · F147 · Tests del reconciliador GitOps y de la Application de Argo CD.
// Requisitos: git. Ejecuta: node --test f147-gitops-argocd/gitops.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { Aplicacion, contiene } from './reconciliador.js';

function repoTemporal() {
  const repo = mkdtempSync(join(tmpdir(), 'gitops-test-'));
  const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=T', '-c', 'user.email=t@ejemplo.dev', ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  cpSync('k8s', join(repo, 'k8s'), { recursive: true });
  git('add', '.'); git('commit', '-q', '-m', 'inicial');
  return { repo, git, fin: () => rmSync(repo, { recursive: true, force: true }) };
}
const IMAGEN = (app) => app.vivo.get('Deployment/tienda/pedidos').spec.template.spec.containers[0];

test('contiene() ignora los campos que solo existen en el clúster', () => {
  assert.equal(contiene({ a: 1 }, { a: 1, status: { listo: true } }), true);
  assert.equal(contiene({ a: 1 }, { a: 2 }), false);
});

test('sin selfHeal, un cambio a mano se queda (OutOfSync); con selfHeal se corrige', () => {
  const { repo, fin } = repoTemporal();
  for (const selfHeal of [false, true]) {
    const app = new Aplicacion({ repo, selfHeal });
    app.reconciliar();
    IMAGEN(app).image = 'pedidos:a-mano';
    const r = app.reconciliar();
    assert.equal(r.estado, selfHeal ? 'Synced' : 'OutOfSync');
    assert.equal(IMAGEN(app).image, selfHeal ? 'pedidos:1.0.0' : 'pedidos:a-mano');
  }
  fin();
});

test('sin prune, lo borrado de Git sigue en el clúster; con prune desaparece', () => {
  const { repo, git, fin } = repoTemporal();
  const apps = [new Aplicacion({ repo, prune: false }), new Aplicacion({ repo, prune: true })];
  apps.forEach((a) => a.reconciliar());
  git('rm', '-q', 'k8s/40-hpa.yaml'); git('commit', '-q', '-m', 'sin hpa');
  const [sinPrune, conPrune] = apps.map((a) => a.reconciliar());
  assert.equal(sinPrune.estado, 'OutOfSync');
  assert.equal(apps[0].vivo.has('HorizontalPodAutoscaler/tienda/pedidos'), true);
  assert.equal(conPrune.estado, 'Synced');
  assert.equal(apps[1].vivo.has('HorizontalPodAutoscaler/tienda/pedidos'), false);
  fin();
});

test('un commit nuevo se despliega en el siguiente ciclo', () => {
  const { repo, git, fin } = repoTemporal();
  const app = new Aplicacion({ repo });
  app.reconciliar();
  execFileSync('sed', ['-i.bak', 's/pedidos:1.0.0/pedidos:1.1.0/', join(repo, 'k8s/20-deployment.yaml')]);
  rmSync(join(repo, 'k8s/20-deployment.yaml.bak'));
  git('commit', '-q', '-am', '1.1.0');
  assert.equal(app.reconciliar().accion, 'sync');
  assert.equal(IMAGEN(app).image, 'pedidos:1.1.0');
  fin();
});

test('la Application de Argo CD sigue main/k8s con prune y selfHeal', () => {
  const a = parse(readFileSync(new URL('./application.yaml', import.meta.url), 'utf8'));
  assert.equal(a.kind, 'Application');
  assert.deepEqual([a.spec.source.targetRevision, a.spec.source.path], ['main', 'k8s']);
  assert.deepEqual(a.spec.syncPolicy.automated, { prune: true, selfHeal: true });
});
