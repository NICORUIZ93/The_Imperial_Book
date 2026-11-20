// Módulo 32 · F184 · test: corre la simulación de Gatling (corta: 20 reservas/s durante 3 s) contra el sistema y exige
// que se cumplan sus aserciones (p99 < 300 ms y < 1 % de errores). Necesita Java 17+ (Gatling JS descarga su bundle la
// primera vez en ~/.gatling). node --test f184-carga-gatling/carga.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { crearGateway } from '../f183-gateway-rate-limit/gateway.js';
import { LimitadorMemoria } from '../f183-gateway-rate-limit/limitador.js';
import { cerrar, escuchar } from '../comun/http.js';

let hayJava = true;
try { execFileSync('java', ['-version'], { stdio: 'ignore' }); } catch { hayJava = false; }

function gatling(args) {
  return new Promise((ok) => {
    const p = spawn(process.execPath, ['node_modules/@gatling.io/cli/target/index.js', 'run', '--sources-folder', 'f184-carga-gatling/src',
      '--results-folder', 'logs/gatling', '--non-interactive', '--simulation', 'reservas', ...args], { cwd: new URL('..', import.meta.url).pathname });
    let salida = '';
    p.stdout.on('data', (d) => { salida += d; }); p.stderr.on('data', (d) => { salida += d; });
    p.on('close', (codigo) => ok({ codigo, salida }));
  });
}

test('Gatling: 20 reservas/s durante 3 s cumplen el SLO de la API', { skip: !hayJava && 'falta Java (https://adoptium.net)', timeout: 300_000 }, async () => {
  const s = await montarSistema({ aforo: 10_000 });
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: 50, capacidad: 100 }) });
  const url = await escuchar(g);
  try {
    const { codigo, salida } = await gatling([`url=${url}`, 'tasa=20', 'segundos=3']);
    assert.match(salida, /percentage of failed events is less than 1\.0 : true/);
    assert.equal(codigo, 0, salida.slice(-2000));
    assert.equal(s.repo.todas().filter((r) => r.estado === 'CONFIRMADA').length, s.repo.todas().length);
  } finally { await cerrar(g); await s.cerrar(); }
});
