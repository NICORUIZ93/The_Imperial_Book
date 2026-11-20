// Módulo 32 · F184 · Test de carga del sistema de reservas con Gatling JS 3.16.101 (motor Gatling 3.16.1).
// Modelo ABIERTO: llegan `tasa` reservas por segundo, pase lo que pase con las anteriores (como en la vida real).
// Ejecuta (con el sistema en marcha: node f184-carga-gatling/arrancar-sistema.js):
//   npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --simulation reservas tasa=60 segundos=20
import { arrayFeeder, constantUsersPerSec, getParameter, global, jsonPath, rampUsersPerSec, scenario, simulation, StringBody } from '@gatling.io/core';
import { http, status } from '@gatling.io/http';

export default simulation((setUp) => {
  const url = getParameter('url', 'http://localhost:8080');          // el gateway (F183)
  const tasa = parseInt(getParameter('tasa', '60'));                  // reservas por segundo en el pico
  const segundos = parseInt(getParameter('segundos', '20'));
  // Clientes del gateway, en rueda: la carga se reparte como en producción. claves=1 reproduce el error común (F184).
  const claves = parseInt(getParameter('claves', '3'));
  const clientes = arrayFeeder([{ apiKey: 'clave-web' }, { apiKey: 'clave-movil' }, { apiKey: 'clave-socio' }].slice(0, claves)).circular();

  const protocolo = http.baseUrl(url).acceptHeader('application/json').contentTypeHeader('application/json');

  const reservar = scenario('Reservar una entrada')
    .feed(clientes)
    .exec(
      http('POST /reservas').post('/reservas').header('X-Api-Key', '#{apiKey}')
        .body(StringBody('{"eventoId":"concierto-1","clienteId":"#{apiKey}","importe":80,"tarjeta":"4242-OK"}'))
        .check(status().is(202), jsonPath('$.reservaId').saveAs('reservaId')),
      http('GET /reservas/{id}').get('/reservas/#{reservaId}').header('X-Api-Key', '#{apiKey}').check(status().is(200)),
    );

  setUp(reservar.injectOpen(rampUsersPerSec(1).to(tasa).during(5), constantUsersPerSec(tasa).during(segundos)))
    .protocols(protocolo)
    // El objetivo del proyecto (SLO de la API): p99 < 300 ms y menos del 1 % de errores. Si no se cumple, Gatling sale con error.
    .assertions(global().responseTime().percentile(99).lt(300), global().failedRequests().percent().lt(1.0));
});
