// Módulo 20 · F129 · Test de integración contra los emuladores (docker compose up -d --wait):
// el mismo secreto se lee igual por los tres proveedores y una rotación se ve al saltar la caché.
// Ejecuta: node --test f129-secretos/secretos.integracion.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECRETO_BD } from './comun.js';
import { proveedorAws, proveedorAzure, proveedorVault, SecretosConCache } from './secretos.js';
import { LOCAL, sembrar } from './sembrar.js';

const proveedores = {
  aws: () => proveedorAws({ endpoint: LOCAL.aws }),
  vault: () => proveedorVault({ endpoint: LOCAL.vault, token: LOCAL.vaultToken }),
  azure: () => proveedorAzure({ url: LOCAL.azure, emulador: true }),
};

for (const [nombre, crear] of Object.entries(proveedores)) {
  test(`${nombre}: lee el secreto sembrado y recoge la rotación con { forzar: true }`, async () => {
    await sembrar('Cl4ve-Pr0d-2026');
    const proveedor = crear();
    const primera = await proveedor.leer(SECRETO_BD);
    assert.deepEqual(primera.valor, { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' });

    const secretos = new SecretosConCache(proveedor);
    assert.equal((await secretos.obtener(SECRETO_BD)).clave, 'Cl4ve-Pr0d-2026');
    await sembrar('Rotada-2026-11');                                                       // rotación
    assert.equal((await secretos.obtener(SECRETO_BD)).clave, 'Cl4ve-Pr0d-2026', 'dentro del TTL sigue la de caché');
    assert.equal((await secretos.obtener(SECRETO_BD, { forzar: true })).clave, 'Rotada-2026-11');
    assert.notEqual(secretos.estado()[0].version, primera.version, 'la versión cambia con la rotación');
  });
}
