# Módulo 19: Empaquetado y despliegue

Cubre JARs, imágenes OCI, configuración por entorno, secretos y despliegue seguro.

**Entorno (2026-05-22):** JDK 27, Maven 3.10.0, Docker 29.9.3.

## Aprende construyendo

### Tema 1: Jar ejecutable y capas · Intermedio · 35 min
#### Fat/boot jar y capas
**Definición formal.** Boot jar empaqueta app y dependencias; layering separa dependencias/código para optimizar imagen Docker.
**Para qué sirve.** Despliegue reproducible.
**Cuándo usarlo.** Deploy estándar de Spring Boot.
**Ejemplo mínimo enfocado (comando).**
```bash
./mvnw -DskipTests package
java -jar target/*.jar
```
**Caso de uso real.** Deploy en VM/contenedor.
**Error común.** Empaquetar secretos en jar. Corrección: externalizar config.
**Verificación.** **Nota:** requiere proyecto Maven.

### Tema 2: Imagen OCI con Buildpacks/Jib · Avanzado · 40 min
#### Imagen OCI
**Definición formal.** Imagen de contenedor estándar OCI construida desde la app.
**Para qué sirve.** Runtime consistente.
**Cuándo usarlo.** Kubernetes/containers.
**Ejemplo mínimo enfocado (comando).**
```bash
./mvnw spring-boot:build-image
```
**Caso de uso real.** Imagen para k8s.
**Error común.** Usar tag `latest` en prod. Corrección: tags inmutables/digest.
**Verificación.** **Nota:** requiere Docker.

### Tema 3: Config, secretos y migraciones en despliegue · Avanzado · 40 min
#### Config externa
**Definición formal.** Configuración suministrada por entorno (env vars, config maps, secret stores), no hardcodeada.
**Para qué sirve.** Mismo artefacto en todos los entornos.
**Cuándo usarlo.** Siempre.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
DB_URL=jdbc:postgres://db/app java -jar app.jar
```
**Caso de uso real.** Credenciales desde secret manager.
**Error común.** Secretos en repo. Corrección: secret manager.
**Verificación.** **Nota:** depende de entorno.

#### Migraciones en deploy
**Definición formal.** Aplicar cambios de esquema de forma controlada durante despliegue.
**Para qué sirve.** Compatibilidad de código+BD.
**Cuándo usarlo.** Cambios de esquema.
**Ejemplo mínimo enfocado.** Flyway al arranque o job previo.
**Caso de uso real.** Expand/contract migration.
**Error común.** Cambio destructivo incompatible con versión vieja. Corrección: migración backward-compatible.
**Verificación.** **Nota:** requiere BD.

## Cierre
Empaqueta una vez, configura por entorno, protege secretos y despliega con migraciones seguras.
