// Módulo 21 · F132 · Error común: copiar una llamada de Winston a Pino. El orden de los argumentos es el contrario.
// Pino:    logger.info(objeto, 'mensaje')     Winston: logger.info('mensaje', objeto)
// Ejecuta: node f132-pino-winston/error-comun.js
import pino from 'pino';

const log = pino({ base: { servicio: 'pedidos' }, timestamp: false }, pino.destination({ dest: 1, sync: true }));
log.info('pedido creado', { id: 'P-1', total: 5 }); // MAL: estilo Winston → el objeto desaparece sin avisar
log.info({ id: 'P-1', total: 5 }, 'pedido creado'); // BIEN: estilo Pino
log.info('pedido %s creado', 'P-1');                 // los argumentos extra solo se usan con %s, %d, %o…
