import { CourseModule, createModule as m } from '../course-module.model';

/**
 * Curso Docker de cero a experto (specs/010, piloto del estándar v3).
 * Publicación progresiva: un módulo se registra solo cuando todos sus temas cumplen las 12 partes
 * de MASTER-PROMPT v3 (`scripts/audit_topic_standard_v3.py --track docker`).
 */
export const DOCKER_MODULES: CourseModule[] = [
  m(0, 'Linux que necesitas para entender un contenedor', 'Linux para contenedores', 'Fundamentos', '3 h 35 min', '#0e7490',
    'Un contenedor es un proceso de Linux con una vista reducida del sistema y límites. Lo construyes a mano, sin Docker, para que cada comando del curso tenga un significado concreto.',
    ['Procesos, PID y señales: cómo se apaga bien un programa', 'Usuarios, permisos y capacidades: qué puede hacer un proceso', 'Namespaces: darle a un proceso su propia vista del sistema', 'cgroups v2: limitar memoria y CPU de un proceso', 'Un contenedor sin Docker: namespaces, raíz propia y chroot'],
    [
      'Escribe un worker que guarde su trabajo al recibir SIGTERM y reproduce el código 143 sin trap',
      'Ejecuta un programa como nobody con una sola capacidad y comprueba qué puede hacer',
      'Crea namespaces UTS, PID y de red con unshare y explica qué ve el proceso dentro',
      'Limita la memoria de un proceso con cgroup v2 y lee el evento oom_kill',
      'Aísla un proceso en una raíz mínima con namespaces y chroot',
    ],
    ['¿Por qué un contenedor no es una máquina virtual?', '¿Qué diferencia hay entre aislar un proceso y limitarlo?', '¿Por qué un contenedor que se queda sin memoria termina con código 137?'],
    ['Linux', 'unshare', 'cgroups v2'],
    'Worker de RutaFlow con apagado ordenado, ejecutado como usuario sin privilegios, aislado y con límite de memoria.'),
];
