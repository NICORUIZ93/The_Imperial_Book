import { CourseModule, createModule as m } from '../course-module.model';

export const OBSERVABILIDAD_MODULES: CourseModule[] = [
  m(0, 'Observabilidad con Prometheus y Grafana', 'Observabilidad', 'Experto', '3 h', '#475569',
    'Sin métricas no sabes si tu sistema está sano. Aprende el modelo de series temporales y cómo alertar antes del incidente.',['Modelo de métricas de Prometheus — counter, gauge, histogram', 'PromQL esencial', 'Dashboards en Grafana', 'Alertmanager y reglas de alerta', 'SLI, SLO, SLA', 'OpenTelemetry como estándar de instrumentación', 'Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate', 'Chaos engineering: experimentos controlados para comprobar que el sistema resiste fallos'],
    [
      'Expón una métrica counter de requests totales desde tu propia API y verifica que Prometheus la scrapea',
      'Escribe una query PromQL que calcule la tasa de requests por segundo en los últimos 5 minutos',
      'Crea un dashboard en Grafana que visualice esa métrica en tiempo real',
      'Configura una regla de alerta que dispare si la tasa de error supera el 5% durante 2 minutos',
      'Define un SLO propio (ej. 99% de requests bajo 200ms) y documenta cómo lo medirías',
    ],
    ['¿Qué diferencia hay entre un counter y un gauge en Prometheus?', '¿Por qué un SLO es más útil para el negocio que solo monitorear "está caído / no está caído"?'],
    ['Prometheus', 'Grafana'],
    'Dashboard de Grafana con métricas reales de una app y una alerta configurada.'),
  m(1, 'Logging centralizado', 'Logging', 'Experto', '2 h 30 min', '#475569',
    'Centraliza logs de múltiples servicios para poder buscarlos y correlacionarlos en segundos, no en horas.',
    ['Logging estructurado (JSON)', 'Pipeline ELK/EFK', 'Loki + Grafana como alternativa ligera', 'Correlation ID a través de servicios'],
    [
      'Configura tu app para loguear en formato JSON estructurado en vez de texto libre',
      'Levanta Loki + Grafana (o ELK) en Docker Compose y envía los logs de tu app ahí',
      'Busca y filtra logs por un campo específico (ej. nivel de error) desde Grafana',
      'Propaga un correlation ID entre dos servicios que se comunican entre sí, y búscalo en el sistema centralizado para ver el flujo completo',
    ],
    ['¿Por qué buscar en logs centralizados es mucho más rápido que entrar a cada contenedor con docker logs?', '¿Qué ventaja tiene Loki (indexa solo metadata) frente a Elasticsearch (indexa todo el contenido)?'],
    ['Loki', 'Elasticsearch'],
    'Stack de logging centralizado que correlaciona logs de al menos dos servicios.'),
  m(2, 'SRE y plataforma — confiabilidad, incidentes y supply chain', 'SRE y plataforma', 'Experto', '5 h', '#475569',
    'Evoluciona del pipeline funcional a una plataforma operable con objetivos de confiabilidad y evidencia de procedencia.',['Confiabilidad es una expectativa cuantificada', 'Una alerta debe conducir a una acción', 'Construir una imagen no demuestra de dónde proviene', 'Una plataforma interna es un producto con límites'],
    ['Define SLO y burn-rate alerts', 'Ejecuta un game day y postmortem', 'Genera SBOM, firma y verifica una imagen', 'Diseña golden path con límites y métricas'],
    ['¿Por qué disponibilidad máxima no siempre es el objetivo correcto?', '¿Qué prueba una firma de artefacto y qué no prueba?'],
    ['Prometheus', 'OpenTelemetry', 'Argo CD', 'Sigstore'],
    'Paquete operativo con SLO, alertas, incidente ensayado y cadena de suministro verificable.'),
];
