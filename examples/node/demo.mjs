// Demo Node.js para The_Imperial_Book.
// Objetivo: practicar servicios compatibles con AWS dentro de Floci/LocalStack
// sin usar una cuenta real de AWS ni generar costos.
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

// Todos los clientes usan el mismo endpoint local.
// Floci escucha por defecto en http://localhost:4566 para APIs estilo AWS.
// La region y credenciales "test" son convenciones locales: no autentican
// contra AWS real, pero permiten que el SDK firme peticiones de forma valida.
const config = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

// S3 necesita forcePathStyle cuando se trabaja contra emuladores locales.
// Esto hace que el bucket viaje en la ruta de la URL en lugar de depender
// de subdominios DNS, que normalmente no existen en localhost.
const s3 = new S3Client({ ...config, forcePathStyle: true });

// SQS reutiliza la misma configuracion porque tambien apunta al endpoint AWS local.
const sqs = new SQSClient(config);

// Errores comunes que veras al practicar:
// - NoSuchBucket: el bucket no existe. Solucion: crea "curso-cloud-local"
//   antes de ejecutar este demo o revisa el nombre exacto.
// - QueueDoesNotExist: la cola "pedidos" no existe. Solucion: crea la cola
//   con AWS CLI o con el script de preparacion del laboratorio.
// - ECONNREFUSED: Floci no esta corriendo. Solucion: ejecuta
//   docker compose up -d y valida con scripts/validate-floci.sh.
// - SignatureDoesNotMatch: region o credenciales inconsistentes. En local
//   usa siempre region us-east-1 y credenciales test/test.
function explainAwsError(error) {
  const name = error?.name || error?.Code || "ErrorDesconocido";
  const hints = {
    NoSuchBucket: "Crea el bucket curso-cloud-local antes de subir objetos.",
    QueueDoesNotExist: "Crea la cola pedidos antes de enviar mensajes.",
    ECONNREFUSED: "Levanta Floci con docker compose up -d.",
    SignatureDoesNotMatch: "Revisa region us-east-1 y credenciales test/test.",
  };
  console.error(`Fallo controlado (${name}): ${hints[name] || error.message}`);
}

try {
  // PutObjectCommand escribe un objeto en un bucket creado previamente por el laboratorio.
  // Bucket: contenedor logico.
  // Key: ruta/nombre del objeto dentro del bucket.
  // Body: contenido que Floci guardara en el almacenamiento local.
  await s3.send(
    new PutObjectCommand({
      Bucket: "curso-cloud-local",
      Key: "saludos/node.txt",
      Body: "Hola desde Node.js y Cloud Local\n",
    }),
  );

  // GetQueueUrlCommand resuelve el URL interno de una cola SQS existente.
  // Usar QueueUrl evita acoplar el codigo al formato exacto de URLs que usa el emulador.
  const { QueueUrl } = await sqs.send(
    new GetQueueUrlCommand({ QueueName: "pedidos" }),
  );

  // SendMessageCommand publica un mensaje JSON.
  // En sistemas reales, este patron desacopla productores y consumidores:
  // una API puede encolar un pedido y otro proceso puede leerlo despues.
  await sqs.send(
    new SendMessageCommand({
      QueueUrl,
      MessageBody: JSON.stringify({ pedidoId: "P-200", estado: "creado" }),
    }),
  );

  // ListObjectsV2Command confirma que el objeto quedo guardado en S3 local.
  // ReceiveMessageCommand lee mensajes disponibles de la cola local.
  // Estos console.log son verificaciones educativas: muestran exactamente
  // que devuelve el SDK para que el estudiante compare teoria vs salida real.
  console.log(await s3.send(new ListObjectsV2Command({ Bucket: "curso-cloud-local" })));
  console.log(await sqs.send(new ReceiveMessageCommand({ QueueUrl })));
} catch (error) {
  explainAwsError(error);
  throw error;
}
