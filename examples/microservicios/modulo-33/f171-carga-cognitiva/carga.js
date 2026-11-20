// Módulo 29 · F171 · Carga cognitiva de un equipo: una medida RELATIVA (no existe una exacta) a partir de su inventario
// y de una encuesta 1–5, separando los tres tipos de carga: intrínseca (habilidades), extrínseca (mecánica) y germana
// (foco en el dominio), como los nombran Skelton y Pais.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.

// Umbrales del curso (ajústalos a tu organización; lo importante es compararlos en el tiempo y entre equipos).
export const UMBRALES = {
  dominiosDificiles: 1, // Team Topologies, figura 3.2: «no más de un dominio complicado o complejo por equipo»
  tecnologias: 4, // lenguajes, bases de datos y brokers distintos que el equipo opera
  pasosManuales: 3, // pasos manuales para desplegar
  alertasSemana: 10, // alertas que despiertan a alguien cada semana
  encuestaMinima: 3, // media de «¿cuánto entiendes los sistemas que operas?» (1 = nada, 5 = todo)
};

export function evaluar(equipo, u = UMBRALES) {
  const dificiles = equipo.dominios.filter((d) => d.complejidad !== 'simple');
  const encuesta = equipo.encuesta.reduce((s, x) => s + x, 0) / equipo.encuesta.length;
  const avisos = [];
  // Germana: el foco en el dominio de negocio, la carga que SÍ queremos… pero no más de un dominio difícil.
  if (dificiles.length > u.dominiosDificiles)
    avisos.push(`germana: ${dificiles.length} dominios complicados o complejos (${dificiles.map((d) => d.nombre).join(', ')})`);
  // Intrínseca: las habilidades que exige el trabajo (cada tecnología distinta hay que dominarla).
  if (equipo.tecnologias.length > u.tecnologias)
    avisos.push(`intrínseca: ${equipo.tecnologias.length} tecnologías distintas`);
  // Extrínseca: la mecánica que no aporta al problema (despliegues manuales, ruido de alertas).
  if (equipo.pasosManuales > u.pasosManuales) avisos.push(`extrínseca: ${equipo.pasosManuales} pasos manuales por despliegue`);
  if (equipo.alertasSemana > u.alertasSemana) avisos.push(`extrínseca: ${equipo.alertasSemana} alertas por semana`);
  if (encuesta < u.encuestaMinima) avisos.push(`encuesta: entienden sus sistemas ${encuesta.toFixed(1)} de 5`);
  return { equipo: equipo.nombre, encuesta: Number(encuesta.toFixed(1)), avisos, sobrecargado: avisos.length > 0 };
}

// Propuesta: un dominio difícil por equipo stream-aligned; lo extrínseco, a la plataforma.
export function proponer(equipo) {
  const dificiles = equipo.dominios.filter((d) => d.complejidad !== 'simple');
  const simples = equipo.dominios.filter((d) => d.complejidad === 'simple');
  if (dificiles.length <= 1) return [{ nombre: equipo.nombre, dominios: equipo.dominios.map((d) => d.nombre) }];
  return dificiles.map((d, i) => ({
    nombre: `${equipo.nombre}-${d.nombre}`,
    // Los dominios simples se quedan con el primer equipo para no crear equipos sin un flujo con sentido.
    dominios: [d.nombre, ...(i === 0 ? simples.map((s) => s.nombre) : [])],
  }));
}
