// Módulo 29 · F169 · Crea un repositorio Git de ejemplo en una carpeta temporal con 6 commits de negocio.
// Cada funcionalidad (pagos o catálogo) toca su pantalla (web/), su API (api/) y su tabla (bd/), como en la vida real.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const FUNCIONALIDADES = [
  ['pagos', 'Pagar con tarjeta'],
  ['catalogo', 'Buscar productos por nombre'],
  ['pagos', 'Reembolso parcial'],
  ['catalogo', 'Filtrar por precio'],
  ['pagos', 'Pagar con PSE'],
  ['catalogo', 'Productos agotados ocultos'],
];

export function crearRepoDeEjemplo() {
  const dir = mkdtempSync(join(tmpdir(), 'conway-'));
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.name', 'Academia');
  git('config', 'user.email', 'academia@example.com');
  git('config', 'commit.gpgsign', 'false');
  FUNCIONALIDADES.forEach(([flujo, titulo], i) => {
    for (const archivo of [`web/${flujo}/pantalla.js`, `api/${flujo}/rutas.js`, `bd/${flujo}/V${i + 1}.sql`]) {
      mkdirSync(dirname(join(dir, archivo)), { recursive: true });
      writeFileSync(join(dir, archivo), `// ${titulo} (cambio ${i + 1})\n`, { flag: 'a' });
    }
    git('add', '-A');
    git('commit', '-q', '-m', titulo);
  });
  return dir;
}
