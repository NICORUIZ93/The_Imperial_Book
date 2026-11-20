// Módulo 29 · F170 · Dos topologías de la tienda en línea: la inicial (con problemas) y la corregida.
export const INICIAL = {
  equipos: [
    { nombre: 'checkout', tipo: 'stream-aligned', flujo: 'compra y pago' },
    { nombre: 'catalogo', tipo: 'stream-aligned', flujo: 'búsqueda y fichas de producto' },
    { nombre: 'backend', tipo: 'stream-aligned' }, // ¿alineado a qué flujo? a ninguno: es una capa
    { nombre: 'plataforma', tipo: 'platform' },
    { nombre: 'observabilidad', tipo: 'enabling' },
  ],
  interacciones: [
    { de: 'plataforma', a: 'checkout', modo: 'colaboracion' }, // sin fecha de fin: colaboración eterna
    { de: 'plataforma', a: 'catalogo', modo: 'colaboracion', hasta: '2027-03-31' },
    { de: 'observabilidad', a: 'checkout', modo: 'x-as-a-service' }, // el enabling opera el stack por ellos
  ],
};

export const CORREGIDA = {
  equipos: [
    { nombre: 'checkout', tipo: 'stream-aligned', flujo: 'compra y pago' },
    { nombre: 'catalogo', tipo: 'stream-aligned', flujo: 'búsqueda y fichas de producto' },
    { nombre: 'fraude', tipo: 'complicated-subsystem' }, // modelo de riesgo: necesita especialistas
    { nombre: 'plataforma', tipo: 'platform' },
    { nombre: 'observabilidad', tipo: 'enabling' },
  ],
  interacciones: [
    { de: 'plataforma', a: 'checkout', modo: 'x-as-a-service' },
    { de: 'plataforma', a: 'catalogo', modo: 'colaboracion', hasta: '2027-03-31' }, // descubren juntos la API de búsqueda
    { de: 'fraude', a: 'checkout', modo: 'x-as-a-service' },
    { de: 'observabilidad', a: 'checkout', modo: 'facilitacion' }, // enseña a instrumentar y se retira
  ],
};
