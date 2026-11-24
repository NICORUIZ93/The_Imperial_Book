# Módulo 16: Orquestación de flujos con Step Functions


## Aprende construyendo


### Tema 1: State machine y Task states · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a declarar como state machine el mismo flujo que confirmar-entrega (Módulo 5) ya hace en código: validar, guardar el evento, notificar. Prerrequisitos: Módulos 5 y 11 completos.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
aws stepfunctions create-state-machine --name FlujoTareas --definition file://maquina.json --role-arn arn:aws:iam::000000000000:role/sfn-role
aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:000000000000:stateMachine:FlujoTareas --input '{"tarea":"001"}'
```

```json
{
  "StartAt": "ValidarTarea",
  "States": {
    "ValidarTarea": { "Type": "Task", "Resource": "arn:...", "Next": "GuardarEnDynamoDB" },
    "GuardarEnDynamoDB": { "Type": "Task", "Resource": "arn:...", "Next": "EnviarNotificacion" },
    "EnviarNotificacion": { "Type": "Task", "Resource": "arn:...", "End": true }
  }
}
```

Crea el archivo `maquina-confirmar.json`:

```json
{
  "StartAt": "GuardarEvento",
  "States": {
    "GuardarEvento": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:putItem",
      "Parameters": {"TableName": "ShipmentEvents", "Item": {"shipmentId": {"S.$": "$.shipmentId"}, "sequence": {"N": "1"}, "estado": {"S": "entregado"}}},
      "Next": "Notificar"
    },
    "Notificar": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sns:publish",
      "Parameters": {"TopicArn": "arn:aws:sns:us-east-1:000000000000:rutaflow-envio-entregado", "Message.$": "$.shipmentId"},
      "End": true
    }
  }
}
```

```bash
aws stepfunctions create-state-machine --name ConfirmarEntregaFlow --definition file://maquina-confirmar.json --role-arn arn:aws:iam::000000000000:role/sfn-role
aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:000000000000:stateMachine:ConfirmarEntregaFlow --input '{"shipmentId":"env-7001"}'
```

</details>

### Tema 2: Choice state, Retry y Catch · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a agregarle a ConfirmarEntregaFlow (Tema 1) manejo explícito de errores: reintentar si DynamoDB está ocupado, y una rama de error que no oculte la causa. Prerrequisitos: Tema 1 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar vas a agregarle a `ConfirmarEntregaFlow` (Tema 1) manejo explícito de errores: reintentar si DynamoDB está ocupado, y una rama de error que no oculte la causa. Prerrequisitos: Tema 1 de este módulo.

</details>

### Tema 3: Express vs Standard, y cuándo EventBridge Pipes es suficiente · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a decidir, con números reales, si ConfirmarEntregaFlow debería ser Standard o Express — y si el planificador de rutas (Módulo 14) necesita Step Functions en absoluto. Prerrequisitos: Módulo 14, Temas 1-2 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["Standard workflow"] --> A1["larga duración, ejecución exactamente una vez, trazabilidad completa"]
    B["Express workflow"] --> B1["alto volumen, corta duración, al menos una vez, económico"]
    C["EventBridge Pipes"] --> C1["conexión directa simple entre dos servicios, sin orquestación compleja"]
```

#### ► REGLA PRÁCTICA
Si solo necesitas conectar dos servicios sin pasos intermedios, usa EventBridge Pipes y ahórrate Step Functions. Si sí necesitas orquestar varios pasos, elige Standard cuando el flujo sea largo y deba ejecutarse exactamente una vez con trazabilidad completa, y Express cuando sea de alto volumen, corta duración y tolere al menos una vez.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar vas a decidir, con números reales, si `ConfirmarEntregaFlow` debería ser Standard o Express — y si el planificador de rutas (Módulo 14) necesita Step Functions en absoluto. Prerrequisitos: Módulo 14, Temas 1-2 de este módulo.

</details>

### Tema 4: Procesamiento por lotes: trabajos independientes, reintentos e idempotencia · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Python 3.10 o superior. Crea la carpeta academia-labs/cloud/lotes. La demostración corre en tu máquina; la misma estructura se lleva a AWS Batch o a Step Functions.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    E["10 archivos"] --> L1["lote 1"] & L2["lote 2"] & L3["lote 3"]
    L2 -->|"timeout"| R["reintento (máx. 3)"]
    R --> L2
    L1 & L2 & L3 --> S["procesados/*.ok<br/>idempotente"]
    R -->|"3 fallos"| Q["cola de revisión"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```python
import json
from pathlib import Path

ENTRADA = [f"guias-{dia:02d}.csv" for dia in range(1, 11)]  # 10 archivos del mes
TAMANO_LOTE = 4
INTENTOS = 3
salida = Path("procesados"); salida.mkdir(exist_ok=True)
fallos_simulados = {"guias-06.csv": 1}  # falla una vez (por ejemplo, un timeout de red)

def procesar(archivo: str) -> None:
    destino = salida / (archivo + ".ok")
    if destino.exists():            # idempotente: si ya se hizo, no se repite
        return
    if fallos_simulados.get(archivo, 0) > 0:
        fallos_simulados[archivo] -= 1
        raise TimeoutError(f"{archivo}: tiempo agotado")
    destino.write_text(json.dumps({"archivo": archivo, "filas": 1000}))

# Cada lote es como un trabajo de un array job: independiente y reintentable.
for n, inicio in enumerate(range(0, len(ENTRADA), TAMANO_LOTE), start=1):
    lote = ENTRADA[inicio:inicio + TAMANO_LOTE]
    for intento in range(1, INTENTOS + 1):
        try:
            for archivo in lote:
                procesar(archivo)
            print(f"lote {n} ({len(lote)} archivos): ok en el intento {intento}")
            break
        except TimeoutError as error:
            print(f"lote {n}: {error}, reintentando")
    else:
        print(f"lote {n}: falló {INTENTOS} veces, va a la cola de revisión")

print(f"procesados: {len(list(salida.glob('*.ok')))} de {len(ENTRADA)}")
```

```bash
cd academia-labs/cloud/lotes
python3 lote.py
python3 lote.py   # segunda vez: idempotente
```

```text
lote 1 (4 archivos): ok en el intento 1
lote 2: guias-06.csv: tiempo agotado, reintentando
lote 2 (4 archivos): ok en el intento 2
lote 3 (2 archivos): ok en el intento 1
procesados: 10 de 10
```

</details>
