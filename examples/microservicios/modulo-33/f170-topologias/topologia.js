// Módulo 29 · F170 · Tipos de equipo e interacciones de Team Topologies (Skelton y Pais, 2019) como datos revisables,
// y una simulación del tiempo que espera un equipo stream-aligned según cómo le llega la infraestructura.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.

export const TIPOS = ['stream-aligned', 'platform', 'enabling', 'complicated-subsystem'];
export const MODOS = ['colaboracion', 'x-as-a-service', 'facilitacion'];

// Revisa una topología { equipos: [{nombre, tipo, flujo?}], interacciones: [{de, a, modo, hasta?}] }.
// Las reglas 1–4 salen de las definiciones del libro; la 5 es una heurística de este curso.
export function revisar({ equipos, interacciones }) {
  const avisos = [];
  const tipo = new Map(equipos.map((e) => [e.nombre, e.tipo]));
  for (const e of equipos) {
    if (!TIPOS.includes(e.tipo)) avisos.push(`${e.nombre}: tipo desconocido «${e.tipo}»`);
    // 1. Un stream-aligned se alinea a un flujo de trabajo del negocio: si no sabes cuál, no lo es.
    if (e.tipo === 'stream-aligned' && !e.flujo) avisos.push(`${e.nombre}: stream-aligned sin flujo de negocio`);
  }
  for (const i of interacciones) {
    if (!MODOS.includes(i.modo)) avisos.push(`${i.de} → ${i.a}: modo desconocido «${i.modo}»`);
    // 2. Un enabling ayuda y enseña (facilitación); si construye y opera cosas para otros, es otro tipo de equipo.
    if (tipo.get(i.de) === 'enabling' && i.modo !== 'facilitacion')
      avisos.push(`${i.de} → ${i.a}: un enabling interactúa por facilitación, no por ${i.modo}`);
    // 3. La colaboración es intensa y temporal: debe tener fecha de fin.
    if (i.modo === 'colaboracion' && !i.hasta) avisos.push(`${i.de} ↔ ${i.a}: colaboración sin fecha de fin`);
  }
  // 4. Una plataforma es un producto interno: si nadie la consume como servicio, no está cumpliendo su papel.
  for (const p of equipos.filter((e) => e.tipo === 'platform'))
    if (!interacciones.some((i) => i.de === p.nombre && i.modo === 'x-as-a-service'))
      avisos.push(`${p.nombre}: plataforma sin consumidores x-as-a-service`);
  // 5. (Heurística del curso) Un equipo en más de una colaboración a la vez se queda sin tiempo para su flujo.
  const colaboraciones = new Map();
  for (const i of interacciones.filter((x) => x.modo === 'colaboracion'))
    for (const n of [i.de, i.a]) colaboraciones.set(n, (colaboraciones.get(n) ?? 0) + 1);
  for (const [n, c] of colaboraciones) if (c > 1) avisos.push(`${n}: ${c} colaboraciones a la vez`);
  return avisos;
}

// Simulación: `pedidos` equipos stream-aligned piden cada uno una base de datos nueva el mismo día.
//  - por tickets: un equipo de operaciones atiende `capacidadDia` tickets al día, en orden de llegada.
//  - autoservicio: la plataforma lo ofrece como servicio (una orden o un formulario) y tarda `minutosAutoservicio`.
export function simularEspera({ pedidos, capacidadDia, minutosAutoservicio }) {
  const diasTicket = Array.from({ length: pedidos }, (_, i) => Math.floor(i / capacidadDia) + 1);
  const media = diasTicket.reduce((s, d) => s + d, 0) / pedidos;
  return {
    porTickets: { mediaDias: Math.round(media * 10) / 10, peorDias: diasTicket.at(-1) },
    autoservicio: { minutos: minutosAutoservicio },
  };
}
