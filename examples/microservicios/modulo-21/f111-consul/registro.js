// Módulo 17 · F111 · Service Discovery con Consul: AUTO-REGISTRO de una instancia con check TTL.
// Requisitos: Node.js 26.13.1 LTS, consul 2.0.1 (npm) y un agente Consul 2.1.0.

// Registra la instancia y empieza a enviar latidos. Devuelve cómo darla de baja y cómo dejar de latir.
export async function registrar(consul, { nombre, id, direccion, puerto, ttlSegundos = 3, meta = {} }) {
  await consul.agent.service.register({
    name: nombre, // nombre lógico: lo que buscan los clientes («catalogo»)
    id, // identificador ÚNICO de esta instancia («catalogo-3111»)
    address: direccion,
    port: puerto,
    meta,
    check: {
      // Check TTL: la instancia promete avisar «sigo viva» antes de que venza el plazo.
      // Si deja de hacerlo (se colgó, murió, perdió la red), Consul la marca «critical».
      ttl: `${ttlSegundos}s`,
      // Y si pasa 1 minuto en critical, Consul la borra sola del catálogo.
      deregistercriticalserviceafter: '1m',
    },
  });
  const idCheck = `service:${id}`; // Consul nombra así el check declarado dentro de un servicio
  const latido = () => consul.agent.check.pass(idCheck).catch((e) => console.error(`latido fallido: ${e.message}`));
  await latido(); // primer latido: pasa de critical a passing
  const intervalo = setInterval(latido, (ttlSegundos * 1000) / 3); // 3 latidos por plazo: tolera perder 2
  intervalo.unref();

  return {
    detenerLatidos: () => clearInterval(intervalo),
    async darDeBaja() {
      clearInterval(intervalo);
      await consul.agent.service.deregister(id); // baja voluntaria: desaparece al instante
    },
  };
}
