# Ejemplos de referencia

Esta carpeta contiene implementaciones de comparación, no el punto de partida.

Regla del curso: intenta cada reto durante al menos 30 minutos, registra el error
y explica con tus palabras qué esperabas antes de consultar estos archivos.

- `python/demo.py`: cliente combinado de S3, SQS y DynamoDB.
- `node/demo.mjs`: cliente combinado de S3 y SQS.
- `java/FlociS3Example.java`: ejemplo S3 combinado con AWS SDK for Java v2.
- `go/floci_s3_example.go`: ejemplo S3 con AWS SDK for Go v2.
- `rust/floci_s3_example.rs`: ejemplo S3 con AWS SDK for Rust.
- `init/ready.d/10-seed.sh`: ejemplo de inicialización idempotente.

El `docker-compose.yml` principal no monta el hook de inicialización. Si llegas
al módulo de hooks, deberás descubrir y agregar tú mismo el montaje correcto.

## Ejemplos por operación (node/, python/, java/, go/, rust/)

Además de los demos combinados de arriba, cada servicio de la ruta base
(Módulos 2-7) tiene un archivo independiente por operación, en los cinco
lenguajes, para consultar una operación puntual sin leer un demo completo.
Cada archivo se ejecuta solo, acepta argumentos por línea de comandos, y
asume Floci corriendo en `http://localhost:4566` (ver Módulo 1).

| Servicio | Operación | Node.js | Python | Java | Go | Rust |
|---|---|---|---|---|---|---|
| S3 | Listar buckets | `s3-list-buckets.js` | `s3_list_buckets.py` | `S3ListBuckets.java` | `s3_list_buckets.go` | `s3_list_buckets.rs` |
| S3 | Crear bucket | `s3-create-bucket.js` | `s3_create_bucket.py` | `S3CreateBucket.java` | `s3_create_bucket.go` | `s3_create_bucket.rs` |
| S3 | Subir archivo | `s3-upload.js` | `s3_upload.py` | `S3Upload.java` | `s3_upload.go` | `s3_upload.rs` |
| S3 | Descargar archivo | `s3-download.js` | `s3_download.py` | `S3Download.java` | `s3_download.go` | `s3_download.rs` |
| S3 | Eliminar objeto/bucket | `s3-delete.js` | `s3_delete.py` | `S3Delete.java` | `s3_delete.go` | `s3_delete.rs` |
| SQS | Crear cola | `sqs-create-queue.js` | `sqs_create_queue.py` | `SqsCreateQueue.java` | `sqs_create_queue.go` | `sqs_create_queue.rs` |
| SQS | Enviar mensaje | `sqs-send-message.js` | `sqs_send_message.py` | `SqsSendMessage.java` | `sqs_send_message.go` | `sqs_send_message.rs` |
| SQS | Recibir mensaje | `sqs-receive-message.js` | `sqs_receive_message.py` | `SqsReceiveMessage.java` | `sqs_receive_message.go` | `sqs_receive_message.rs` |
| SQS | Eliminar mensaje | `sqs-delete-message.js` | `sqs_delete_message.py` | `SqsDeleteMessage.java` | `sqs_delete_message.go` | `sqs_delete_message.rs` |
| DynamoDB | Crear tabla | `dynamodb-create-table.js` | `dynamodb_create_table.py` | `DynamoDbCreateTable.java` | `dynamodb_create_table.go` | `dynamodb_create_table.rs` |
| DynamoDB | Insertar item | `dynamodb-put-item.js` | `dynamodb_put_item.py` | `DynamoDbPutItem.java` | `dynamodb_put_item.go` | `dynamodb_put_item.rs` |
| DynamoDB | Obtener item | `dynamodb-get-item.js` | `dynamodb_get_item.py` | `DynamoDbGetItem.java` | `dynamodb_get_item.go` | `dynamodb_get_item.rs` |
| DynamoDB | Actualizar item | `dynamodb-update-item.js` | `dynamodb_update_item.py` | `DynamoDbUpdateItem.java` | `dynamodb_update_item.go` | `dynamodb_update_item.rs` |
| DynamoDB | Eliminar item | `dynamodb-delete-item.js` | `dynamodb_delete_item.py` | `DynamoDbDeleteItem.java` | `dynamodb_delete_item.go` | `dynamodb_delete_item.rs` |
| DynamoDB | Query (por clave) | `dynamodb-query.js` | `dynamodb_query.py` | `DynamoDbQuery.java` | — | — |
| DynamoDB | Scan (tabla completa) | `dynamodb-scan.js` | `dynamodb_scan.py` | `DynamoDbScan.java` | — | — |
| Lambda | Crear función | `lambda-create-function.js` | `lambda_create_function.py` | `LambdaCreateFunction.java` | `lambda_create_function.go` | `lambda_create_function.rs` |
| Lambda | Invocar | `lambda-invoke.js` | `lambda_invoke.py` | `LambdaInvoke.java` | `lambda_invoke.go` | `lambda_invoke.rs` |
| Lambda | Actualizar código | `lambda-update.js` | `lambda_update.py` | `LambdaUpdate.java` | `lambda_update.go` | `lambda_update.rs` |
| Lambda | Eliminar función | `lambda-delete.js` | `lambda_delete.py` | `LambdaDelete.java` | — | — |
| API Gateway | Crear API | `apigateway-create-api.js` | `apigateway_create_api.py` | `ApiGatewayCreateApi.java` | `apigateway_create_api.go` | `apigateway_create_api.rs` |
| API Gateway | Crear recurso | `apigateway-create-resource.js` | `apigateway_create_resource.py` | `ApiGatewayCreateResource.java` | `apigateway_create_resource.go` | `apigateway_create_resource.rs` |
| API Gateway | Crear método | `apigateway-put-method.js` | `apigateway_put_method.py` | `ApiGatewayPutMethod.java` | `apigateway_put_method.go` | `apigateway_put_method.rs` |
| API Gateway | Desplegar a un stage | `apigateway-deploy.js` | `apigateway_deploy.py` | `ApiGatewayDeploy.java` | — | — |
| IAM | Crear usuario | `iam-create-user.js` | `iam_create_user.py` | `IamCreateUser.java` | `iam_create_user.go` | `iam_create_user.rs` |
| IAM | Crear política | `iam-create-policy.js` | `iam_create_policy.py` | `IamCreatePolicy.java` | `iam_create_policy.go` | `iam_create_policy.rs` |
| IAM | Asignar política | `iam-attach-policy.js` | `iam_attach_policy.py` | `IamAttachPolicy.java` | `iam_attach_policy.go` | `iam_attach_policy.rs` |

Las filas marcadas con "—" en Go/Rust son intencionales: esas cuatro operaciones
(Query, Scan, borrar función Lambda, desplegar API Gateway) solo existen en los
tres lenguajes usados en el track Cloud (Node.js, Python, Java); Go y Rust no
son lenguajes de ningún track del curso, se añadieron como referencia extra y
no se amplían más allá de lo ya cubierto.

Ejecución:

```bash
# Node.js (requiere: npm install en examples/node/)
node examples/node/s3-create-bucket.js mi-bucket

# Python (requiere: pip install boto3)
python3 examples/python/s3_create_bucket.py mi-bucket

# Java (requiere el AWS SDK for Java v2 en el classpath, ver examples/java/FlociS3Example.java)
java -cp <classpath> examples/java/S3CreateBucket.java mi-bucket

# Go (requiere: go get github.com/aws/aws-sdk-go-v2/config github.com/aws/aws-sdk-go-v2/service/s3)
go run examples/go/s3_create_bucket.go mi-bucket

# Rust (requiere un Cargo.toml propio con aws-config, aws-sdk-s3,
# aws-credential-types y tokio; cada archivo es un binario independiente)
cargo run --bin s3_create_bucket -- mi-bucket
```

## Requisitos y salida esperada

Las versiones de CI son el entorno comprobado del repositorio, no una promesa de
versión mínima para cada ejemplo. Java, Go y Rust no tienen manifiestos ni
toolchains fijados aquí: crea el proyecto y declara las dependencias indicadas
antes de copiar el ejemplo.

| Lenguaje | Requisito comprobado/documentado | Preparación |
|---|---|---|
| Node.js | CI usa Node.js 24; `examples/node/package.json` declara AWS SDK v3 (`^3.0.0`) y dependencias del demo. | `cd examples/node && npm install` |
| Python | CI usa Python 3.11; `requirements.txt` declara `boto3>=1.34,<2`. | `python3 -m pip install -r examples/python/requirements.txt` |
| Java | Sin versión fijada ni `pom.xml`; los ejemplos usan AWS SDK for Java v2. | Añade AWS SDK v2 a tu proyecto y classpath. |
| Go | Sin versión fijada ni `go.mod`; los ejemplos usan AWS SDK for Go v2. | Crea `go.mod` e instala los módulos indicados por el ejemplo. |
| Rust | Sin versión fijada ni `Cargo.toml`; los ejemplos usan crates AWS SDK. | Crea `Cargo.toml` con los crates indicados por el ejemplo. |

Con Floci iniciado y sin buckets, el ejemplo de Node debe mostrar:

```text
No hay buckets todavía. Crea uno con s3-create-bucket.js
```

El de Python muestra la misma indicación, con el nombre
`s3_create_bucket.py`.

Después de crear `mi-bucket`, la salida empieza con `Buckets:` y contiene una
línea para `mi-bucket` con una fecha de creación. El timestamp concreto depende
del runtime y de Floci; no lo uses como valor fijo en una prueba.

Notas por lenguaje:

- Los archivos de `dynamodb_get_item.go` y `dynamodb_update_item.go` requieren
  además `github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue`.
- `lambda_create_function.go`/`lambda_update.go` usan `archive/zip` de la
  librería estándar de Go, sin dependencias extra.
- `lambda_create_function.rs`/`lambda_update.rs` requieren el crate `zip`.
- `iam_create_policy.rs` requiere el crate `serde_json`.
- Los archivos Go y Rust no traen `go.mod`/`Cargo.toml`: son de referencia,
  como los de Java, que tampoco traen `pom.xml`. Créalos en tu propio
  proyecto al copiar un ejemplo.

## Ejemplos por track (`tracks/<track-id>/`)

Los ejemplos de arriba son específicos del track Cloud (SDK de AWS contra
Floci). Cada uno de los otros 11 tracks tiene su propia carpeta en
`examples/tracks/<track-id>/`, con 4-6 archivos independientes en el
lenguaje real de ese track, mapeados a sus módulos más distintivos — no
sustituyen al código ya embebido en las lecciones (`web/public/content/`),
son la versión "cópialo y ejecútalo aparte" de esos mismos conceptos.

| Track | Carpeta | Lenguaje | Cubre |
|---|---|---|---|
| Angular | `tracks/angular/` | TypeScript | Signals, DI, routing guards, formularios reactivos, interceptores HTTP |
| React | `tracks/react/` | JSX | Hooks, Context API, React Router, data fetching, custom hooks |
| Java | `tracks/java/` | Java | POO, colecciones/genéricos, streams, virtual threads, records/pattern matching |
| Spring Boot | `tracks/spring-boot/` | Java | REST controllers, Spring Data JPA, Spring Security, Actuator, WebFlux |
| Kotlin Multiplatform | `tracks/kotlin-multiplatform/` | Kotlin | Coroutines/Flow, expect/actual, Ktor Client, SQLDelight |
| Android | `tracks/android/` | Kotlin | Jetpack Compose, Navigation Compose, StateFlow+ViewModel, Retrofit, Room |
| iOS | `tracks/ios/` | Swift | SwiftUI, @State/@Binding, async/await + actores, URLSession, SwiftData |
| Flutter | `tracks/flutter/` | Dart | Stateful/Stateless widgets, layout responsive, Provider, http, sqflite |
| Node.js | `tracks/node/` | JavaScript | `http` nativo, Express, Prisma, JWT, patrones async avanzados |
| JavaScript | `tracks/javascript/` | JavaScript | Closures/scope, prototypes/clases, Event Loop/Promises, DOM/eventos |
| DevOps | `tracks/devops/` | Dockerfile/YAML/HCL | Multi-stage build, Compose con healthchecks, Terraform, Kubernetes, CI |

Igual que el resto de `examples/`: sin toolchains completos en este
repositorio (sin `pom.xml`, `Package.swift`, `pubspec.yaml`, etc.) — son
archivos de referencia para pegar en tu propio proyecto ya inicializado con
Angular CLI / Create React App / Xcode / Android Studio / `flutter create`,
según corresponda.

## Proyecto final de referencia

`examples/project-final/` contiene una implementación de referencia completa
del Sistema de Gestión de Tareas del Módulo 9: funciones Lambda, Terraform
para desplegar la infraestructura, y un workflow de GitHub Actions. Sigue la
misma regla de arriba: constrúyelo tú mismo primero.
