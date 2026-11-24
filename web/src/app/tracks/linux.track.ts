import { CourseModule, createModule as m } from '../course-module.model';

export const LINUX_MODULES: CourseModule[] = [
  m(0, 'Linux y shell scripting para DevOps', 'Linux y shell', 'Fundamentos', '3 h', '#475569',
    'La base de todo pipeline: navegar, automatizar y depurar desde la terminal sin depender de una interfaz gráfica.',['Sistema de archivos y permisos (chmod/chown)', 'Procesos, señales y jobs en segundo plano', 'Pipes, redirección y filtros (grep, awk, sed)', 'Variables de entorno y scripts bash robustos (set -euo pipefail)', 'Cron y tareas programadas', 'Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor', 'Redes — modelo OSI, TCP/IP, DNS y balanceadores de carga', 'Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor', 'NGINX y proxies desde cero', 'Usuarios, grupos, permisos compartidos y sudo con mínimo privilegio', 'systemd: servicios, timers y logs con journalctl'],
    [
      'Crea un archivo y cambia sus permisos con chmod para que solo el dueño pueda escribir, y verifica con ls -l',
      'Escribe un script bash con set -euo pipefail que falle inmediatamente si un comando intermedio falla',
      'Combina grep, awk y sed en un solo pipe para extraer y transformar líneas de un archivo de log',
      'Lanza un proceso en background con &, listalo con jobs, y termínalo con kill',
      'Programa una tarea con cron que ejecute un script cada 5 minutos y verifica su ejecución en los logs',
    ],
    ['¿Por qué set -euo pipefail debería ser el estándar en cualquier script de CI/CD?', '¿Qué diferencia hay entre una señal SIGTERM y SIGKILL?'],
    ['Bash', 'Linux'],
    'Script bash idempotente que prepara un entorno de desarrollo desde cero.'),
  m(1, 'Servidor propio: VPS endurecido, TLS y recuperación', 'Servidor propio', 'Experto', '6 h', '#475569',
    'Administra un servidor real sin depender de un proveedor gestionado: acceso, firewall, TLS, despliegue con systemd y un respaldo que se restaura en un simulacro.',['Aprovisionar y endurecer: usuario, SSH, firewall y parches', 'Dominio, TLS y borde: DNS, Let\'s Encrypt y Cloudflare', 'Despliegue y rollback: systemd, nginx y artefactos versionados', 'Respaldos que se restauran: restic, RPO/RTO y simulacro'],
    [
      'Crea un usuario con sudo, desactiva el acceso root y verifica la configuración con sshd -T antes de reiniciar',
      'Abre solo 22, 80 y 443 con ufw y comprueba que el resto queda rechazado',
      'Emite un certificado con certbot, inspecciona sus fechas y simula su vencimiento',
      'Publica una aplicación con systemd detrás de nginx y revierte a la release anterior',
      'Respalda con restic, corrompe un snapshot y demuestra que restic check lo detecta',
      'Restaura en una carpeta limpia y mide el tiempo de recuperación frente al RTO declarado',
    ],
    ['¿Cómo evitas quedarte fuera del servidor al endurecer SSH?', '¿Qué diferencia hay entre el modo proxy y el modo DNS de Cloudflare?', '¿Por qué un backup sin restauración probada no es un backup?'],
    ['Ubuntu 24.04', 'nginx', 'systemd', 'certbot', 'restic', 'Cloudflare'],
    'Servidor con acceso endurecido, TLS renovable, despliegue versionado con rollback y restauración de respaldo verificada.'),
];
