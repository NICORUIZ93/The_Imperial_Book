import { CourseModule, createModule as m } from '../course-module.model';

export const SEGURIDAD_MODULES: CourseModule[] = [
  m(0, 'Seguridad, privacidad y modelado de amenazas', 'Seguridad aplicada', 'Integración', '10 h', '#6d5dfc',
    'Integra seguridad desde requisitos: identifica activos y amenazas, protege identidades y secretos, aplica criptografía mediante primitivas confiables y prueba que acciones no autorizadas fallan.',[
      'Activos, amenazas, riesgos y límites de confianza',
      'Identidad, contraseñas, sesiones y autorización',
      'Criptografía aplicada, TLS, claves y secretos',
      'Validación, vulnerabilidades web, privacidad y respuesta',
      'Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo'
    ],
    [
      'Construye un diagrama de flujo de datos y threat model del inventario',
      'Implementa contraseñas con scrypt, usuarios y autorización por roles',
      'Elimina secretos del repositorio y verifica detección en CI',
      'Añade pruebas negativas, audit log y plan de respuesta a incidentes',
    ],
    [
      '¿Qué diferencia hay entre autenticación y autorización?',
      '¿Por qué una contraseña se hashea y no se cifra para almacenarla?',
      '¿Qué convierte una amenaza en un riesgo priorizable?',
    ],
    ['Java 25', 'javax.crypto', 'H2', 'OpenSSL', 'OWASP'],
    'Inventario endurecido con threat model, credenciales seguras, roles, auditoría, pruebas de abuso y runbook de incidentes.'),
  m(1, 'Seguridad DevSecOps', 'DevSecOps', 'Experto', '2 h 30 min', '#475569',
    'La seguridad no es un paso final: se integra en cada etapa del pipeline.',['Escaneo de imágenes y dependencias (Trivy, Snyk)', 'Integración en el pipeline', 'Gestión de secretos (Vault, SOPS)', 'Menor privilegio en CI/CD', 'SBOM y supply chain security', 'SAST, DAST y SCA — diferencias y herramientas', 'Reconocimiento de tu propio laboratorio: escaneo de puertos y banners'],
    [
      'Escanea tu propia imagen Docker con Trivy y revisa las vulnerabilidades reportadas',
      'Agrega el escaneo de Trivy como un paso del pipeline de CI que bloquee el merge si hay vulnerabilidades críticas',
      'Configura secretos del pipeline (tokens, credenciales) usando los secrets nativos de GitHub Actions, nunca hardcodeados',
      'Revisa los permisos del token por defecto de tu pipeline de CI y redúcelos al mínimo necesario',
      'Genera un SBOM (lista de dependencias) de tu proyecto y documenta para qué sirve ante una vulnerabilidad reportada en una librería',
    ],
    ['¿Por qué escanear la imagen en CI es mejor que descubrir la vulnerabilidad ya en producción?', '¿Qué es el principio de menor privilegio aplicado a un pipeline de CI/CD?'],
    ['Trivy', 'Vault'],
    'Pipeline que escanea vulnerabilidades de la imagen y bloquea el deploy si hay críticas.'),
];
