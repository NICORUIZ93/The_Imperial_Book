# Módulo 31: Arquitectura cloud resiliente — redes, landing zones y recuperación

Una colección de servicios funcionales todavía puede fallar como sistema. La arquitectura experta hace explícitas las fronteras de red y gobierno, conecta disponibilidad con necesidades del negocio y demuestra recuperación mediante experimentos. El objetivo no es dibujar nubes redundantes, sino justificar y verificar qué ocurre cuando una zona, una identidad o un conjunto de datos deja de estar disponible.


## Aprende construyendo


### Tema 1: Una red segura empieza por flujos, no por subredes · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar el flujo real que demo-nodo (Módulo 21) necesita hacia la base de datos de facturación (Módulo 13), por referencia de grupo, no por rango abierto. Prerrequisitos: Módulos 13 y 21 completos.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    I["Internet"] --> W["edge/WAF"] --> B["balanceador"] --> A["API privada"] --> D["DB privada"]
    B --> L["logs/metrics"]
    A --> EP["endpoint privado"]
    ND["flujo no declarado"] -->|bloqueado| X["✗"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```hcl
resource "aws_security_group_rule" "api_to_db" {
  type                     = "ingress"
  security_group_id        = aws_security_group.db.id
  source_security_group_id = aws_security_group.api.id
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  description              = "Solo la API accede a PostgreSQL"
}
```

```mermaid
flowchart LR
    I["Internet"] --> W["edge/WAF"] --> B["balanceador"] --> A["API privada"] --> D["DB privada"]
    B --> L["logs/metrics"]
    A --> EP["endpoint privado"]
    ND["flujo no declarado"] -->|bloqueado| X["✗"]
```

```bash
DB_SG=$(aws ec2 create-security-group --group-name rutaflow-db-interna \
  --description "Solo accesible desde demo-nodo" --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id "$DB_SG" --protocol tcp --port 5432 \
  --source-group demo-nodo
```

</details>

### Tema 2: Una landing zone convierte gobierno en una base repetible · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a escribir el guardrail real que impediría que alguien desactive CloudTrail en la cuenta de producción de RutaFlow. Prerrequisitos: Módulo 29 (STS, cuentas).

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    ID["identidad federada"] --> ORG["organización RutaFlow"]
    ORG --> SEC["cuenta seguridad/logs\n(inmutables)"]
    ORG --> PROD["cuenta producción"]
    ORG --> NOPROD["cuenta no-producción"]
    ORG --> SAND["cuenta sandbox"]
    SEC -.->|"guardrail: Deny StopLogging"| PROD
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "cloudtrail:StopLogging",
    "Resource": "*",
    "Condition": {"StringNotLike": {"aws:PrincipalArn": "*/SecurityAutomation"}}
  }]
}
```

```mermaid
flowchart TD
    ID["identidad federada"] --> ORG["organización RutaFlow"]
    ORG --> SEC["cuenta seguridad/logs\n(inmutables)"]
    ORG --> PROD["cuenta producción"]
    ORG --> NOPROD["cuenta no-producción"]
    ORG --> SAND["cuenta sandbox"]
    SEC -.->|"guardrail: Deny StopLogging"| PROD
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

Crea el archivo `guardrail-cloudtrail.json`:

```json
{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"cloudtrail:StopLogging","Resource":"*",
  "Condition":{"StringNotLike":{"aws:PrincipalArn":"*/SecurityAutomation"}}}]}
```

```bash
aws iam simulate-custom-policy --policy-input-list file://guardrail-cloudtrail.json \
  --action-names cloudtrail:StopLogging --resource-arns "*"
```

</details>

### Tema 3: Disponibilidad y recuperación responden preguntas distintas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a asignar un RTO y un RPO reales a tres servicios concretos de RutaFlow, no un "lo más rápido posible" genérico. Prerrequisitos: Módulos 4 y 13 completos.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["región A: zonas A/B\n(disponibilidad)"] -->|"réplica/backup"| B["región B o almacén aislado\n(recuperación)"]
    F["fallo"] --> DET["detectar"] --> CONT["contener"] --> REST["conmutar/restaurar"] --> VAL["validar"] --> COM["comunicar"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
Servicio         RTO       RPO       Estrategia
catálogo         4 h       24 h      reconstruir + backup
pedidos          30 min    5 min     warm standby + réplica
pagos            5 min     ~0        proveedor idempotente + failover ensayado
```

```mermaid
flowchart LR
    A["región A: zonas A/B\n(disponibilidad)"] -->|"réplica/backup"| B["región B o almacén aislado\n(recuperación)"]
    F["fallo"] --> DET["detectar"] --> CONT["contener"] --> REST["conmutar/restaurar"] --> VAL["validar"] --> COM["comunicar"]
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```text
Servicio                  RTO       RPO       Estrategia
confirmar-entrega         5 min     ~0        rol IAM temporal + reintentos (Módulo 5), sin estado propio que perder
ShipmentEvents            30 min    5 min     PITR de DynamoDB (Módulo 4) + réplica
rutaflow-facturacion      4 h       24 h      snapshot diario (Módulo 13) + restore probado
```

</details>

### Tema 4: Un backup solo existe operativamente después de restaurarlo · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a restaurar de verdad el snapshot de rutaflow-facturacion (Módulo 13) y a medir si el RTO del Tema 3 se cumple en la práctica, no solo en la tabla. Prerrequisitos: Módulo 13 Tema 2, Tema 3 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    B["backup"] --> R["restaurar aislado"] --> I["integridad"] --> PF["prueba funcional"] --> M["medir RTO/RPO"]
    H["hipótesis"] --> L["limitar"] --> IF["inyectar fallo"] --> O["observar"] --> AB["abortar/recuperar"] --> AP["aprender"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```yaml
experiment:
  hypothesis: "La API conserva su SLO al perder una réplica"
  steady_state: "success_rate >= 0.99 and p95_ms < 500"
  action: "terminar una réplica no líder"
  abort: "error_rate > 0.05 for 2m"
  verify: ["alarm fired", "traffic shifted", "capacity recovered"]
```

```mermaid
flowchart LR
    B["backup"] --> R["restaurar aislado"] --> I["integridad"] --> PF["prueba funcional"] --> M["medir RTO/RPO"]
    H["hipótesis"] --> L["limitar"] --> IF["inyectar fallo"] --> O["observar"] --> AB["abortar/recuperar"] --> AP["aprender"]
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
time aws rds restore-db-instance-from-db-snapshot --db-instance-identifier rutaflow-facturacion-gameday \
  --db-snapshot-identifier snap-facturacion-001
aws rds wait db-instance-available --db-instance-identifier rutaflow-facturacion-gameday
psql -h localhost -U admin -d postgres -c "SELECT count(*) FROM facturas;"
```

</details>

### Tema 5: Well-Architected: revisar una arquitectura con los seis pilares · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Python 3.10 o superior. Crea la carpeta academia-labs/cloud/well-architected. Ten a mano el diagrama de la arquitectura del proyecto integrador.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["Arquitectura RutaFlow"] --> P["6 pilares<br/>preguntas sí/no"]
    P --> H["riesgos altos"]
    P --> M["riesgos medios"]
    H --> X["plan: resolver primero"]
    M --> Y["backlog con fecha"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```python
# Revisión ligera de Well-Architected: cada pilar con preguntas de sí/no y su riesgo.
REVISION = {
    "Excelencia operativa": {"runbooks versionados": True, "despliegues automatizados": True},
    "Seguridad": {"MFA en todas las cuentas": True, "cifrado en reposo": True, "mínimo privilegio revisado": False},
    "Confiabilidad": {"multi-AZ en la base": False, "respaldos restaurados en prueba": True},
    "Eficiencia de rendimiento": {"pruebas de carga recientes": False, "caché frente a la base": True},
    "Optimización de costos": {"etiquetas de costo": True, "presupuestos con alerta": True},
    "Sostenibilidad": {"apagado nocturno de entornos de prueba": False, "instancias Graviton evaluadas": True},
}
ALTO_RIESGO = {"multi-AZ en la base", "mínimo privilegio revisado"}

for pilar, preguntas in REVISION.items():
    cumplidas = sum(preguntas.values())
    faltan = [p for p, ok in preguntas.items() if not ok]
    marca = "OK " if not faltan else "!! "
    detalle = "" if not faltan else " · falta: " + ", ".join(
        f"{p}{' (riesgo alto)' if p in ALTO_RIESGO else ''}" for p in faltan)
    print(f"{marca}{pilar}: {cumplidas}/{len(preguntas)}{detalle}")

altos = [p for preguntas in REVISION.values() for p, ok in preguntas.items() if not ok and p in ALTO_RIESGO]
print(f"Riesgos altos a resolver primero: {len(altos)}")
```

```bash
cd academia-labs/cloud/well-architected
python3 revision_wa.py
```

```text
OK Excelencia operativa: 2/2
!! Seguridad: 2/3 · falta: mínimo privilegio revisado (riesgo alto)
!! Confiabilidad: 1/2 · falta: multi-AZ en la base (riesgo alto)
!! Eficiencia de rendimiento: 1/2 · falta: pruebas de carga recientes
OK Optimización de costos: 2/2
!! Sostenibilidad: 1/2 · falta: apagado nocturno de entornos de prueba
Riesgos altos a resolver primero: 2
```

</details>

### Tema 6: Residencia y soberanía de datos: que los datos personales vivan donde la ley permite · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Python 3.10 o superior. Crea academia-labs/cloud/residencia. En un proyecto real, genera el plan con terraform show -json plan.out > plan.json; aquí usarás un plan de ejemplo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    P["terraform plan -json"] --> R["residencia.py"]
    R --> C{"¿datos=personales<br/>fuera de regiones permitidas?"}
    C -->|sí| B["BLOQUEADO: CI falla"]
    C -->|no| A["apply"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    P["terraform plan -json"] --> R["residencia.py"]
    R --> C{"¿datos=personales<br/>fuera de regiones permitidas?"}
    C -->|sí| B["BLOQUEADO: CI falla"]
    C -->|no| A["apply"]
```

```python
import json
import sys

# Regla de residencia: los datos personales de clientes de Colombia solo pueden vivir en estas regiones.
REGIONES_PERMITIDAS = {"us-east-1", "sa-east-1"}  # acordadas con el área legal
ETIQUETA = "datos"  # valor "personales" marca recursos con datos personales

def revisar(plan: dict) -> list[str]:
    hallazgos = []
    for recurso in plan["resource_changes"]:
        despues = recurso["change"]["after"] or {}
        etiquetas = despues.get("tags_all") or {}
        if etiquetas.get(ETIQUETA) != "personales":
            continue
        region = despues.get("region", plan["region"])
        if region not in REGIONES_PERMITIDAS:
            hallazgos.append(f"{recurso['address']}: datos personales en {region}")
    return hallazgos

plan = json.load(open(sys.argv[1]))
hallazgos = revisar(plan)
for h in hallazgos:
    print("BLOQUEADO", h)
print(f"{len(hallazgos)} problema(s) de residencia")
sys.exit(1 if hallazgos else 0)
```

```json
{
  "region": "us-east-1",
  "resource_changes": [
    {"address": "aws_s3_bucket.fotos", "change": {"after": {"tags_all": {"datos": "personales"}}}},
    {"address": "aws_s3_bucket.respaldo_eu", "change": {"after": {"region": "eu-west-1", "tags_all": {"datos": "personales"}}}},
    {"address": "aws_s3_bucket.logs_eu", "change": {"after": {"region": "eu-west-1", "tags_all": {"datos": "tecnicos"}}}}
  ]
}
```

```bash
cd academia-labs/cloud/residencia
python3 residencia.py plan.json; echo "salida: $?"
```

```text
BLOQUEADO aws_s3_bucket.respaldo_eu: datos personales en eu-west-1
1 problema(s) de residencia
salida: 1
```

</details>

### Nube de evolución continua y vigilancia de retiros

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar nube de evolución continua y vigilancia de retiros.

</details>

### Método de estudio y proyecto de ampliación

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar método de estudio y proyecto de ampliación.

</details>
