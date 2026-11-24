import { CourseModule, createModule as m } from '../course-module.model';

export const DOCKER_MODULES: CourseModule[] = [
  m(0, 'Docker — imágenes y buenas prácticas', 'Docker', 'Fundamentos', '3 h', '#475569',
    'Empaqueta cualquier aplicación en una imagen reproducible. Entiende capas, cache de build y por qué el tamaño de imagen importa.',['Dockerfile multi-stage', 'Capas e invalidación de caché', 'Imágenes base distroless/alpine', 'Volúmenes vs bind mounts', 'Redes en Docker', 'Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor', 'Operación diaria: inspect, stats, events y respaldo de volúmenes', 'Contenedores sin privilegios: usuario no root, sistema de archivos de solo lectura y capacidades mínimas', 'Elegir el motor de contenedores local: Docker Desktop, Podman, Colima y Rancher Desktop'],
    [
      'Escribe un Dockerfile de una sola etapa para una API propia y mide el tamaño final de la imagen',
      'Reescríbelo como multi-stage y compara el tamaño — documenta la diferencia',
      'Reordena las instrucciones del Dockerfile para maximizar el cache de capas (copia package.json antes que el resto del código)',
      'Cambia la imagen base a una variante alpine o distroless y verifica que la app sigue funcionando',
      'Monta un volumen para persistir datos entre reinicios del contenedor y verifica que sobreviven a un docker rm',
    ],
    ['¿Por qué el orden de las instrucciones en un Dockerfile afecta directamente la velocidad de build?', '¿Qué riesgo de seguridad reduce una imagen distroless frente a una basada en Ubuntu completo?'],
    ['Docker'],
    'Imagen Docker optimizada (multi-stage, <100MB) de una API propia.'),
  m(1, 'Docker Compose y orquestación local', 'Docker Compose', 'Fundamentos', '2 h', '#475569',
    'Levanta arquitecturas completas con un solo comando, igual que ya haces con Cloud Local en este mismo proyecto.',
    ['Servicios, dependencias y healthchecks', 'Variables de entorno y .env', 'Redes y descubrimiento por nombre de servicio', 'Perfiles para distintos entornos'],
    [
      'Escribe un docker-compose.yml con una app, una base de datos y una caché Redis',
      'Agrega un healthcheck a la base de datos y configura depends_on con condition: service_healthy en la app',
      'Externaliza la configuración sensible en un archivo .env y verifica que docker compose la inyecta correctamente',
      'Verifica que la app puede llamar a la base de datos por su nombre de servicio (no localhost) gracias a la red interna de Compose',
      'Configura perfiles para levantar solo un subconjunto de servicios según el entorno (dev vs test)',
    ],
    ['¿Por qué depends_on sin healthcheck no garantiza que el servicio dependiente ya esté listo para recibir tráfico?', '¿Cómo resuelven los contenedores el nombre de otro servicio sin IPs hardcodeadas?'],
    ['Docker Compose'],
    'docker-compose.yml que levanta app + base de datos + caché con healthchecks.'),
  m(2,
    'Fundamentos de Docker y contenedores',
    'Docker y contenedores',
    'Fundamentos', '2 h', '#475569',
    'Virtualización vs contenedores, imágenes y capas, y los comandos esenciales de Docker y Docker Compose antes de levantar Floci.',[
      'Virtualización vs contenedores',
      'Imágenes y capas',
      'Registros de contenedores (Docker Hub)',
      'Comandos esenciales de Docker',
      'Docker Compose — servicios, redes y volúmenes'
    ],
    [
      'Ejecuta docker pull hello-world y luego docker run hello-world, y explica con tus palabras qué hizo cada comando',
      'Lista los contenedores activos con docker ps y los detenidos con docker ps -a',
      'Escribe un docker-compose.yml mínimo con un servicio y levántalo con docker compose up',
      'Laboratorio 1.1 — Levantar Floci AWS: docker run -p 4566:4566 floci/floci:latest y verifica con curl http://localhost:4566/_localstack/health',
      'Laboratorio 1.2 — Configurar AWS CLI: aws configure y pruébalo con aws s3 ls --endpoint-url=http://localhost:4566',
    ],
    ['¿Qué diferencia hay entre una imagen Docker y un contenedor en ejecución?', '¿Por qué Floci se distribuye como imagen Docker en vez de un instalador tradicional?'],
    ['Docker', 'Docker Compose'],
    'Floci AWS corriendo en el puerto 4566, con AWS CLI configurado y verificado contra ese endpoint.',
    ['aws']
  ),

];
