"""Demo Python para The_Imperial_Book.

Este archivo muestra como usar boto3 contra Floci/LocalStack en localhost.
La idea es practicar S3, SQS y DynamoDB con el mismo codigo mental que se usa
en AWS real, pero sin credenciales reales, sin internet y sin costos.
"""

import json

import boto3
from botocore.exceptions import ClientError, EndpointConnectionError


# Floci expone las APIs compatibles con AWS en el puerto 4566.
# Cambiar este valor es suficiente si el laboratorio se levanta en otro host.
ENDPOINT = "http://localhost:4566"

# Configuracion comun para todos los clientes boto3.
# endpoint_url fuerza a boto3 a llamar al emulador local en vez de AWS real.
# region_name mantiene las respuestas consistentes con los pasos del curso.
# Las credenciales "test" son valores locales; no deben usarse en produccion.
COMMON = {
    "endpoint_url": ENDPOINT,
    "region_name": "us-east-1",
    "aws_access_key_id": "test",
    "aws_secret_access_key": "test",
}

# Los clientes representan APIs concretas.
# s3 gestiona objetos, sqs gestiona colas y dynamodb usa un recurso de alto
# nivel para trabajar con tablas e items de forma mas expresiva.
s3 = boto3.client("s3", **COMMON)
sqs = boto3.client("sqs", **COMMON)
dynamodb = boto3.resource("dynamodb", **COMMON)


def explain_error(error):
    """Traduce errores frecuentes del laboratorio a acciones concretas."""
    if isinstance(error, EndpointConnectionError):
        print("Fallo controlado: Floci no responde. Ejecuta docker compose up -d.")
        return

    code = error.response.get("Error", {}).get("Code", "ErrorDesconocido")
    hints = {
        "NoSuchBucket": "Crea el bucket curso-cloud-local antes de subir objetos.",
        "AWS.SimpleQueueService.NonExistentQueue": "Crea la cola pedidos antes de enviar mensajes.",
        "ResourceNotFoundException": "Crea la tabla Usuarios antes de escribir items.",
        "SignatureDoesNotMatch": "Revisa region us-east-1 y credenciales test/test.",
    }
    print(f"Fallo controlado ({code}): {hints.get(code, error)}")


try:
    # put_object escribe un archivo logico dentro de un bucket local.
    # Bucket debe existir antes de ejecutar este demo.
    # Key funciona como ruta del objeto; no crea carpetas reales, crea un nombre.
    # Body usa bytes para simular el contenido que subiria una aplicacion.
    s3.put_object(
        Bucket="curso-cloud-local",
        Key="saludos/hola.txt",
        Body=b"Hola desde Python y Cloud Local\n",
    )

    # get_queue_url busca la direccion interna de la cola SQS.
    # El curso crea una cola llamada "pedidos"; el demo la usa como canal de eventos.
    queue_url = sqs.get_queue_url(QueueName="pedidos")["QueueUrl"]

    # send_message publica un evento serializado como JSON.
    # Este patron permite que un sistema reciba trabajo ahora y lo procese despues.
    sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps({"pedidoId": "P-100", "estado": "creado"}),
    )

    # Table obtiene una referencia a la tabla local "Usuarios".
    # put_item guarda un registro sencillo para demostrar escritura en DynamoDB.
    table = dynamodb.Table("Usuarios")
    table.put_item(Item={"id": "u-1", "nombre": "Ana", "pais": "Colombia"})

    # Estas impresiones son pruebas de observacion.
    # list_objects_v2 muestra objetos guardados en S3.
    # receive_message muestra mensajes disponibles en SQS.
    # get_item recupera el item escrito en DynamoDB por su clave primaria.
    print("S3:", s3.list_objects_v2(Bucket="curso-cloud-local").get("Contents", []))
    print("SQS:", sqs.receive_message(QueueUrl=queue_url).get("Messages", []))
    print("DynamoDB:", table.get_item(Key={"id": "u-1"}).get("Item"))
except (ClientError, EndpointConnectionError) as error:
    explain_error(error)
    raise
