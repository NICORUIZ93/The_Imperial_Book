// Módulo 17 · F109 · Fitness function de arquitectura: comprueba que las carpetas respetan la regla
// de dependencias (las flechas apuntan hacia el dominio). Ejecuta: node f109-estructura/herramientas/revisar-capas.ts
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Qué capas puede importar cada capa de un módulo (además de sí misma y de shared/).
const PERMITIDO: Record<string, readonly string[]> = {
  dominio: [],
  aplicacion: ['dominio'],
  infraestructura: ['aplicacion', 'dominio'],
  http: ['aplicacion', 'dominio'],
};

export interface Violacion {
  readonly archivo: string;
  readonly importa: string;
  readonly regla: string;
}

function archivosTs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivosTs(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
  );
}

// «modules/pedidos/dominio/pedido.ts» → { modulo: 'pedidos', capa: 'dominio' }
function ubicar(rutaRelativa: string): { modulo?: string; capa?: string; raiz: string } {
  const partes = rutaRelativa.split(sep);
  if (partes[0] !== 'modules') return { raiz: partes[0]! };
  return { raiz: 'modules', modulo: partes[1], capa: partes.length > 3 ? partes[2] : 'index' };
}

export function revisarCapas(src: string): Violacion[] {
  const violaciones: Violacion[] = [];
  for (const archivo of archivosTs(src)) {
    const origen = ubicar(relative(src, archivo));
    const codigo = readFileSync(archivo, 'utf8');
    for (const [, especificador] of codigo.matchAll(/from\s+'([^']+)'/g)) {
      const rel = relative(src, archivo);
      if (!especificador!.startsWith('.')) {
        // Paquete o módulo de Node: el dominio y la aplicación deben quedar libres de librerías.
        if (origen.capa === 'dominio' || origen.capa === 'aplicacion') {
          violaciones.push({ archivo: rel, importa: especificador!, regla: `${origen.capa}/ no importa librerías ni node:*` });
        }
        continue;
      }
      const destinoRel = relative(src, resolve(dirname(archivo), especificador!));
      const destino = ubicar(destinoRel);
      if (destino.raiz === 'shared') continue; // shared/ lo puede usar cualquiera
      if (origen.raiz === 'shared') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'shared/ no importa de módulos ni de config/' });
      } else if (origen.raiz === 'modules' && destino.raiz === 'modules' && origen.modulo !== destino.modulo && destino.capa !== 'index') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'un módulo solo importa el index.ts de otro módulo' });
      } else if (origen.raiz !== 'modules' && destino.raiz === 'modules' && destino.capa !== 'index') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'fuera de modules/ solo se importa el index.ts del módulo' });
      } else if (origen.raiz === 'modules' && origen.modulo === destino.modulo && origen.capa !== 'index' && origen.capa !== destino.capa) {
        if (!(PERMITIDO[origen.capa!] ?? []).includes(destino.capa!)) {
          violaciones.push({ archivo: rel, importa: destinoRel, regla: `${origen.capa}/ no puede importar ${destino.capa}/` });
        }
      } else if (origen.raiz === 'modules' && destino.raiz === 'config') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'los módulos reciben la configuración por parámetro' });
      }
    }
  }
  return violaciones;
}

if (import.meta.main) {
  const src = resolve(import.meta.dirname, '..', process.argv[2] ?? 'src');
  const violaciones = revisarCapas(src);
  for (const v of violaciones) console.log(`✘ ${v.archivo} → ${v.importa}  (${v.regla})`);
  console.log(violaciones.length === 0 ? '✔ 0 violaciones: todas las dependencias apuntan hacia el dominio' : `${violaciones.length} violación(es)`);
  process.exitCode = violaciones.length === 0 ? 0 : 1;
}
