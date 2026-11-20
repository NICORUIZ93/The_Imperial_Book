// Módulo 21 · F134 · Métricas RED (Rate, Errors, Duration) de un servicio HTTP con el cliente oficial de Prometheus.
// Requisitos: Node.js 26.13.1 LTS, @prometheus-io/client 0.16.1 (antes publicado como prom-client, hoy deprecado).
import client from '@prometheus-io/client';

export function crearMetricas({ servicio = 'pedidos' } = {}) {
  // Un Registry propio (no el global): en los tests puedes crear varios sin el error de «ya registrada».
  const registro = new client.Registry();
  registro.setDefaultLabels({ servicio });
  // CPU, memoria, event loop lag, GC, handles activos… con prefijo para distinguirlas de las tuyas.
  client.collectDefaultMetrics({ register: registro, prefix: 'node_' });

  const peticiones = new client.Counter({
    name: 'http_peticiones_total', help: 'Peticiones HTTP atendidas',
    labelNames: ['metodo', 'ruta', 'estado'], registers: [registro],
  });
  const duracion = new client.Histogram({
    name: 'http_peticion_duracion_segundos', help: 'Duración de las peticiones HTTP en segundos',
    labelNames: ['metodo', 'ruta'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5], // en SEGUNDOS: la unidad base de Prometheus
    registers: [registro],
  });
  const enCurso = new client.Gauge({
    name: 'http_peticiones_en_curso', help: 'Peticiones que se están atendiendo ahora', registers: [registro],
  });
  return { registro, peticiones, duracion, enCurso };
}

// Envuelve un manejador HTTP y mide cada petición. «ruta» es la PLANTILLA (/pedidos/:id), nunca la URL real.
export function medir(metricas, ruta, manejador) {
  return async (req, res) => {
    metricas.enCurso.inc();
    const fin = metricas.duracion.startTimer({ metodo: req.method, ruta }); // devuelve una función que observa
    res.on('finish', () => {
      fin();
      metricas.peticiones.inc({ metodo: req.method, ruta, estado: String(res.statusCode) });
      metricas.enCurso.dec();
    });
    await manejador(req, res);
  };
}
