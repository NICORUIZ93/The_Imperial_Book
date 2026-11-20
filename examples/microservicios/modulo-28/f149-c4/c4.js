// Módulo 24 · F149 · Modelo C4 como código: un único modelo JSON y dos vistas generadas (Contexto y Contenedores)
// en Mermaid, más un validador de reglas de notación. Requisitos: Node.js 26.13.1 LTS (sin dependencias).
// Uso: node f149-c4/c4.js f149-c4/modelo.json [contexto|contenedores|validar]
import { readFileSync } from 'node:fs';

const etiqueta = (nombre, tipo, descripcion) => `"<b>${nombre}</b><br/>[${tipo}]<br/>${descripcion}"`;

export function validar(m) {
  const problemas = [];
  const elementos = [...m.personas, ...m.externos, { id: m.sistema.id }, ...m.sistema.contenedores];
  const ids = elementos.map((e) => e.id);
  for (const id of new Set(ids)) if (ids.filter((x) => x === id).length > 1) problemas.push(`id repetido: ${id}`);
  for (const c of m.sistema.contenedores) {
    if (!c.tecnologia) problemas.push(`el contenedor «${c.nombre}» no dice su tecnología`);
    if (!c.descripcion) problemas.push(`el contenedor «${c.nombre}» no tiene descripción`);
    if (/\.(java|ts|js|py)$/.test(c.nombre) || /^clase/i.test(c.tecnologia ?? '')) problemas.push(`«${c.nombre}» es código (nivel 4), no un contenedor: mezcla niveles`);
  }
  const personas = new Set(m.personas.map((p) => p.id));
  const datos = new Set(m.sistema.contenedores.filter((c) => c.tipo).map((c) => c.id));
  for (const r of m.relaciones) {
    const nombre = `${r.de} -> ${r.a}`;
    if (!ids.includes(r.de) || !ids.includes(r.a)) problemas.push(`relación ${nombre}: apunta a un elemento que no existe`);
    if (!r.descripcion) problemas.push(`relación ${nombre}: sin descripción (una flecha sin verbo no dice nada)`);
    if (!r.tecnologia) problemas.push(`relación ${nombre}: sin tecnología o protocolo`);
    if (personas.has(r.de) && datos.has(r.a)) problemas.push(`relación ${nombre}: una persona no usa directamente un almacén de datos`);
  }
  const usados = new Set(m.relaciones.flatMap((r) => [r.de, r.a]));
  for (const c of m.sistema.contenedores) if (!usados.has(c.id)) problemas.push(`el contenedor «${c.nombre}» no se relaciona con nada`);
  return problemas;
}

/** Nivel 1 · Contexto: el sistema como UNA caja, sus personas y los sistemas externos. */
export function contexto(m) {
  const internos = new Set(m.sistema.contenedores.map((c) => c.id));
  const caja = (id) => (internos.has(id) ? m.sistema.id : id);
  const vistas = new Map();
  for (const r of m.relaciones) {
    const [de, a] = [caja(r.de), caja(r.a)];
    if (de !== a && !vistas.has(`${de}>${a}`)) vistas.set(`${de}>${a}`, r);
  }
  return [
    `flowchart TB`,
    ...m.personas.map((p) => `    ${p.id}(${etiqueta(p.nombre, 'Persona', p.descripcion)})`),
    `    ${m.sistema.id}[${etiqueta(m.sistema.nombre, 'Sistema de software', m.sistema.descripcion)}]`,
    ...m.externos.map((e) => `    ${e.id}[${etiqueta(e.nombre, 'Sistema externo', e.descripcion)}]`),
    ...[...vistas].map(([k, r]) => { const [de, a] = k.split('>'); return `    ${de} -- "${r.descripcion}<br/>[${r.tecnologia}]" --> ${a}`; }),
  ].join('\n');
}

/** Nivel 2 · Contenedores: lo que hay DENTRO de la caja del sistema (aplicaciones y almacenes de datos). */
export function contenedores(m) {
  const forma = (c) => (c.tipo === 'base de datos' ? `[(${etiqueta(c.nombre, `Contenedor: ${c.tecnologia}`, c.descripcion)})]` : `[${etiqueta(c.nombre, `Contenedor: ${c.tecnologia}`, c.descripcion)}]`);
  return [
    `flowchart TB`,
    ...m.personas.map((p) => `    ${p.id}(${etiqueta(p.nombre, 'Persona', p.descripcion)})`),
    `    subgraph ${m.sistema.id}["${m.sistema.nombre} [Sistema de software]"]`,
    ...m.sistema.contenedores.map((c) => `        ${c.id}${forma(c)}`),
    `    end`,
    ...m.externos.map((e) => `    ${e.id}[${etiqueta(e.nombre, 'Sistema externo', e.descripcion)}]`),
    ...m.relaciones.map((r) => `    ${r.de} -- "${r.descripcion}<br/>[${r.tecnologia}]" --> ${r.a}`),
  ].join('\n');
}

if (import.meta.main) {
  const [archivo = 'f149-c4/modelo.json', vista = 'validar'] = process.argv.slice(2);
  const m = JSON.parse(readFileSync(archivo, 'utf8'));
  if (vista === 'contexto') console.log(contexto(m));
  else if (vista === 'contenedores') console.log(contenedores(m));
  else {
    const p = validar(m);
    for (const x of p) console.log(`✘ ${x}`);
    console.log(p.length ? `${p.length} problemas` : `✔ modelo «${m.nombre}»: ${m.personas.length} personas, ${m.externos.length} sistemas externos, ${m.sistema.contenedores.length} contenedores, ${m.relaciones.length} relaciones`);
    process.exitCode = p.length ? 1 : 0;
  }
}
