// Módulo 17 · F111 · Service Discovery con Consul: DESCUBRIMIENTO del lado del cliente + balanceo round-robin.
// Requisitos: Node.js 26.13.1 LTS y consul 2.0.1 (npm).

export class SinInstancias extends Error {
  constructor(nombre) {
    super(`No hay instancias sanas de "${nombre}" en Consul`);
    this.name = 'SinInstancias';
  }
}

// Devuelve las instancias SANAS (todos sus checks en passing) de un servicio.
export async function instanciasSanas(consul, nombre) {
  const entradas = await consul.health.service({ service: nombre, passing: true });
  return entradas.map(({ Service, Node }) => ({
    id: Service.ID,
    // Si el servicio no declaró dirección, vale la del nodo donde corre el agente.
    url: `http://${Service.Address || Node.Address}:${Service.Port}`,
  }));
}

// Localizador con caché corta: no pregunta a Consul en cada petición y sobrevive unos segundos sin él.
export function crearLocalizador(consul, { cacheMs = 1000 } = {}) {
  const cache = new Map(); // nombre → { instancias, hasta }
  const turno = new Map(); // nombre → contador para el round-robin

  async function instancias(nombre) {
    const guardado = cache.get(nombre);
    if (guardado && Date.now() < guardado.hasta) return guardado.instancias;
    try {
      const frescas = await instanciasSanas(consul, nombre);
      cache.set(nombre, { instancias: frescas, hasta: Date.now() + cacheMs });
      return frescas;
    } catch (error) {
      if (guardado) return guardado.instancias; // Consul caído: sirve la última lista conocida
      throw error;
    }
  }

  return {
    // Elige la siguiente instancia por turnos (round-robin).
    async siguiente(nombre) {
      const lista = await instancias(nombre);
      if (lista.length === 0) throw new SinInstancias(nombre);
      const n = turno.get(nombre) ?? 0;
      turno.set(nombre, n + 1);
      return lista[n % lista.length];
    },
    olvidar: (nombre) => cache.delete(nombre),
  };
}
