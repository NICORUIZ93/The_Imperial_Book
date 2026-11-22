# Módulo 15: Arquitectura: hexagonal, Clean, C4, ADR y Spring Modulith

Cubre arquitectura de aplicación: puertos/adaptadores, Clean, documentación C4/ADR y modularidad con Spring Modulith.

**Entorno (2026-05-22):** JDK 27. Spring Modulith requiere dependencia.

## Aprende construyendo

### Tema 1: Hexagonal y puertos/adaptadores · Avanzado · 45 min
#### Arquitectura hexagonal
**Definición formal.** Estilo que separa dominio/aplicación de infraestructura mediante puertos (interfaces) y adaptadores (implementaciones).
**Para qué sirve.** Aislar el dominio de frameworks y detalles externos.
**Cuándo usarlo.** Dominios con reglas y múltiples integraciones. No sobreingenierizar CRUD trivial.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb15-hex && cd /tmp/sb15-hex
cat > DemoHex.java << 'JAVA'
interface PuertoRepo { String get(String id); }
class AdaptadorMem implements PuertoRepo { public String get(String id){ return "ok"; } }
class CasoUso { private final PuertoRepo repo; CasoUso(PuertoRepo r){repo=r;} String ejecutar(String id){ return repo.get(id); } }
public class DemoHex { public static void main(String[] args){ System.out.println(new CasoUso(new AdaptadorMem()).ejecutar("1")); } }
JAVA
javac DemoHex.java && java DemoHex
```
**Caso de uso real.** Cambiar adapter REST por otro sin tocar dominio.
**Error común.** Dependencias del dominio hacia Spring/JPA. Corrección: puertos en dominio/aplicación.
**Verificación (JDK 27, 2026-05-22).** Salida: `ok`.

### Tema 2: Clean Architecture, C4 y ADR · Avanzado · 45 min
#### C4/ADR
**Definición formal.** C4 es modelo para documentar arquitectura por niveles; ADR registra decisiones arquitectónicas y su contexto.
**Para qué sirve.** Comunicación y trazabilidad técnica.
**Cuándo usarlo.** Decisiones importantes o equipos múltiples.
**Ejemplo mínimo enfocado (ejecutable como artefacto).**
```bash
mkdir -p /tmp/sb15-adr && cd /tmp/sb15-adr
cat > ADR-001.md << 'MD'
# ADR-001: Usar PostgreSQL
## Contexto
## Decision
## Consecuencias
MD
grep Decision ADR-001.md
```
**Caso de uso real.** Decidir mensajería o BD.
**Error común.** Decisiones solo en chat. Corrección: ADR versionado.
**Verificación (2026-05-22).** Salida: `## Decision`.

### Tema 3: Spring Modulith y fronteras de módulos · Avanzado · 45 min
#### Spring Modulith
**Definición formal.** Herramienta para estructurar y verificar modularidad dentro de un monolito Spring.
**Para qué sirve.** Fronteras explícitas sin pasar a microservicios.
**Cuándo usarlo.** Monolito modular creciendo.
**Ejemplo mínimo enfocado (conceptual).** `@ApplicationModule`, tests de dependencias entre módulos.
**Caso de uso real.** Módulos pedidos, pagos, envíos.
**Error común.** Paquetes sin fronteras reales. Corrección: verificar dependencias con Modulith.
**Verificación.** **Nota:** requiere dependencia Spring Modulith.

## Cierre
Buena arquitectura hace explícitas las fronteras y decisiones. Documenta con C4/ADR y verifica modularidad.
