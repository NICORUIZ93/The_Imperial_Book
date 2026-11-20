// Módulo 31 · F179 · Datos SINTÉTICOS (semilla fija) de 90 días de despliegues: el monolito antes de migrar y el
// servicio «pedidos» después. Cada despliegue: cuándo se hizo commit, cuándo llegó a producción, si falló y cuánto
// tardó en recuperarse, y si fue un despliegue no planificado para arreglar un incidente (rework).
const HORA = 3_600_000;
const DIA = 24 * HORA;

function aleatorio(semilla) { // mulberry32: el mismo resultado en cualquier máquina
  return () => { semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0; let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function generar({ semilla, cadaDias, leadHoras, probFallo, recuperacionHoras }) {
  const r = aleatorio(semilla);
  const inicio = Date.UTC(2026, 6, 1);
  const lista = [];
  for (let t = 0; t < 90 * DIA; t += cadaDias * DIA * (0.5 + r())) {
    const despliegue = inicio + t;
    const fallo = r() < probFallo;
    lista.push({ commit: despliegue - leadHoras * HORA * (0.5 + r()), despliegue, fallo,
      recuperacionMin: fallo ? Math.round(recuperacionHoras * 60 * (0.5 + r())) : 0, rework: false });
    if (fallo) lista.push({ commit: despliegue + HORA, despliegue: despliegue + 2 * HORA, fallo: false, recuperacionMin: 0, rework: true });
  }
  return lista;
}

export const antes = generar({ semilla: 31, cadaDias: 14, leadHoras: 240, probFallo: 0.3, recuperacionHoras: 8 });
export const despues = generar({ semilla: 32, cadaDias: 2, leadHoras: 20, probFallo: 0.08, recuperacionHoras: 1 });
