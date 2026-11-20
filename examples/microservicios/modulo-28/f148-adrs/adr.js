// Módulo 24 · F148 · Herramienta de ADRs (Architecture Decision Records) en Markdown, sin dependencias.
// Formato de docs/microservicios/07-plantillas.md (Nygard 2011 + alternativas con trade-off + fitness function).
// Requisitos: Node.js 26.13.1 LTS.
// Uso: node f148-adrs/adr.js <carpeta> nuevo "Usamos Kafka para los eventos de pedidos"
//      node f148-adrs/adr.js <carpeta> aceptar 3
//      node f148-adrs/adr.js <carpeta> reemplazar 2 "Usamos RabbitMQ con colas de quórum"
//      node f148-adrs/adr.js <carpeta> lint        |   node f148-adrs/adr.js <carpeta> indice
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const SECCIONES = ['Contexto', 'Opciones consideradas', 'Decisión', 'Consecuencias', 'Fitness function', 'Cuándo revisar esta decisión'];
const ESTADO = /^(Propuesto|Aceptado|Rechazado|Reemplazado por ADR-\d{4})$/;
const num = (n) => String(n).padStart(4, '0');
const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function listar(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort().map((archivo) => {
    const texto = readFileSync(join(dir, archivo), 'utf8');
    return {
      archivo,
      numero: Number(archivo.slice(0, 4)),
      titulo: texto.match(/^# ADR-(\d{4}): (.+)$/m)?.[2] ?? null,
      numeroTitulo: Number(texto.match(/^# ADR-(\d{4}):/m)?.[1] ?? NaN),
      estado: texto.match(/^- \*\*Estado:\*\* (.+)$/m)?.[1]?.trim() ?? null,
      fecha: texto.match(/^- \*\*Fecha:\*\* (.+)$/m)?.[1]?.trim() ?? null,
      reemplazaA: Number(texto.match(/^- \*\*Reemplaza a:\*\* ADR-(\d{4})$/m)?.[1] ?? NaN),
      texto,
    };
  });
}

export function nuevo(dir, titulo, { fecha = new Date().toISOString().slice(0, 10), reemplazaA } = {}) {
  mkdirSync(dir, { recursive: true });
  const numero = Math.max(0, ...listar(dir).map((a) => a.numero)) + 1; // nunca se reutiliza un número
  const archivo = `${num(numero)}-${slug(titulo)}.md`;
  const plantilla = readFileSync(new URL('./plantilla.md', import.meta.url), 'utf8')
    .replace('NNNN', num(numero)).replace('<título>', titulo).replace('AAAA-MM-DD', fecha)
    .replace('- **Reemplaza a:** —\n', reemplazaA ? `- **Reemplaza a:** ADR-${num(reemplazaA)}\n` : '');
  writeFileSync(join(dir, archivo), plantilla);
  return archivo;
}

function cambiarEstado(dir, numero, estado) {
  const adr = listar(dir).find((a) => a.numero === numero);
  if (!adr) throw new Error(`no existe ADR-${num(numero)}`);
  writeFileSync(join(dir, adr.archivo), adr.texto.replace(/^- \*\*Estado:\*\* .+$/m, `- **Estado:** ${estado}`));
}
export const aceptar = (dir, numero) => cambiarEstado(dir, numero, 'Aceptado');

/** Una decisión aceptada NO se edita: se escribe otra que la reemplaza y la vieja queda enlazada. */
export function reemplazar(dir, viejo, titulo, opciones) {
  const archivo = nuevo(dir, titulo, { ...opciones, reemplazaA: viejo });
  cambiarEstado(dir, viejo, `Reemplazado por ADR-${archivo.slice(0, 4)}`);
  return archivo;
}

export function lint(dir) {
  const adrs = listar(dir);
  const problemas = [];
  adrs.forEach((a, i) => {
    const id = a.archivo;
    if (a.numero !== i + 1) problemas.push(`${id}: numeración con huecos o repetida (esperaba ${num(i + 1)})`);
    if (a.numeroTitulo !== a.numero) problemas.push(`${id}: el título no es «# ADR-${num(a.numero)}: …»`);
    if (!a.estado || !ESTADO.test(a.estado)) problemas.push(`${id}: estado inválido «${a.estado}»`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.fecha ?? '')) problemas.push(`${id}: fecha que no es AAAA-MM-DD`);
    for (const s of SECCIONES) if (!new RegExp(`^## ${s}$`, 'm').test(a.texto)) problemas.push(`${id}: falta la sección «${s}»`);
    const tabla = a.texto.split(/^## Opciones consideradas$/m)[1]?.split(/^## /m)[0] ?? '';
    const opciones = tabla.split('\n').filter((l) => /^\| [A-Z]\. /.test(l));
    if (opciones.length < 2) problemas.push(`${id}: ${opciones.length} opciones en la tabla; un ADR compara al menos 2`);
    if (/<[^>]+>/.test(a.texto.replace(/```[\s\S]*?```/g, '')) && a.estado !== 'Propuesto') problemas.push(`${id}: quedan huecos <…> de la plantilla`);
    const reemplazo = a.estado?.match(/ADR-(\d{4})/)?.[1];
    if (reemplazo && listar(dir).find((b) => b.numero === Number(reemplazo))?.reemplazaA !== a.numero) {
      problemas.push(`${id}: dice «Reemplazado por ADR-${reemplazo}», pero ese ADR no dice «Reemplaza a: ADR-${num(a.numero)}»`);
    }
  });
  return problemas;
}

export function indice(dir) {
  return ['| ADR | Decisión | Estado | Fecha |', '|---|---|---|---|',
    ...listar(dir).map((a) => `| [ADR-${num(a.numero)}](${a.archivo}) | ${a.titulo} | ${a.estado} | ${a.fecha} |`)].join('\n');
}

if (import.meta.main) {
  const [dir, orden, ...resto] = process.argv.slice(2);
  if (orden === 'nuevo') console.log(`creado ${nuevo(dir, resto.join(' '))}`);
  else if (orden === 'aceptar') { aceptar(dir, Number(resto[0])); console.log(`ADR-${num(resto[0])} aceptado`); }
  else if (orden === 'reemplazar') console.log(`creado ${reemplazar(dir, Number(resto[0]), resto.slice(1).join(' '))}; ADR-${num(resto[0])} queda reemplazado`);
  else if (orden === 'indice') console.log(indice(dir));
  else if (orden === 'lint') {
    const p = lint(dir);
    for (const x of p) console.log(`✘ ${x}`);
    console.log(p.length ? `${p.length} problemas en ${listar(dir).length} ADRs` : `✔ ${listar(dir).length} ADRs sin problemas`);
    process.exitCode = p.length ? 1 : 0;
  } else console.log('órdenes: nuevo <título> · aceptar <n> · reemplazar <n> <título> · lint · indice');
}
