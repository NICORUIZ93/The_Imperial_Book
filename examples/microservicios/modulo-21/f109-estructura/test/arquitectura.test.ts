// Módulo 17 · F109 · La estructura se defiende con un test: si alguien importa en la dirección
// prohibida, el build falla. Ejecuta: node --test f109-estructura/test/arquitectura.test.ts
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { revisarCapas } from '../herramientas/revisar-capas.ts';

test('src/ respeta la regla de dependencias', () => {
  assert.deepEqual(revisarCapas(join(import.meta.dirname, '..', 'src')), []);
});

test('detecta un dominio que importa infraestructura y un acceso al interior de otro módulo', () => {
  const src = mkdtempSync(join(tmpdir(), 'capas-'));
  try {
    for (const d of ['modules/pedidos/dominio', 'modules/pedidos/infraestructura', 'modules/pagos/aplicacion']) {
      mkdirSync(join(src, d), { recursive: true });
    }
    writeFileSync(join(src, 'modules/pedidos/infraestructura/repo.ts'), 'export const repo = {};\n');
    writeFileSync(join(src, 'modules/pedidos/dominio/pedido.ts'), "import { repo } from '../infraestructura/repo.ts';\nexport const p = repo;\n");
    writeFileSync(join(src, 'modules/pagos/aplicacion/cobrar.ts'), "import { p } from '../../pedidos/dominio/pedido.ts';\nexport const c = p;\n");
    const reglas = revisarCapas(src).map((v) => v.regla).sort();
    assert.deepEqual(reglas, ['dominio/ no puede importar infraestructura/', 'un módulo solo importa el index.ts de otro módulo']);
  } finally {
    rmSync(src, { recursive: true, force: true });
  }
});
