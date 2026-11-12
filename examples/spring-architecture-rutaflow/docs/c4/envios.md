# API de envíos · diseño propuesto

Supuesto didáctico: api, worker, cola y base de datos son una propuesta, no procesos ejecutados por este laboratorio. El validador comprueba texto, no relaciones de código.

## Contexto

```mermaid
flowchart LR
    Operador["Operador de bodega"] --> Sistema["API de envíos"]
    Sistema --> Cliente["Cliente que consulta"]
    Sistema --> Transportadora["Transportadora externa"]
```

## Contenedores

```mermaid
flowchart LR
    Web["Web Angular"] --> Api["api Spring Boot"]
    Api --> Db[("base-datos PostgreSQL")]
    Api --> Cola["cola Kafka"]
    Cola --> Worker["worker de asignación"]
    Worker --> Db
```

## Componentes

```mermaid
flowchart LR
    Controlador["Controlador de envíos"] --> CasoUso["Caso de uso AsignarEnvio"]
    CasoUso --> Puerto["Puerto EnvioRepository"]
    Puerto --> Adaptador["Adaptador JPA"]
```

## Código

```mermaid
flowchart LR
    CrearEnvio["CrearEnvio"] --> EnvioRepository["EnvioRepository"]
```
