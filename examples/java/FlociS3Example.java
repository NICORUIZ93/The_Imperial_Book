// Ejemplo Java para Floci — servicio S3 (almacenamiento de objetos).
//
// Requiere AWS SDK for Java v2: dependencia Maven/Gradle "software.amazon.awssdk:s3".
// No necesitas una cuenta de AWS real: este programa habla con Floci, el emulador
// local que expone una API compatible con S3 en http://localhost:4566.
//
// Cómo ejecutarlo:
//   1. Levanta Floci: docker compose up -d (ver docker-compose.yml en la raíz del repo).
//   2. Crea el bucket de prueba una sola vez:
//      aws s3 mb s3://curso-cloud-local --endpoint-url http://localhost:4566
//   3. Compila y ejecuta esta clase con el SDK de S3 en el classpath.
//
// Qué demuestra:
//   - Cómo redirigir el cliente oficial de AWS hacia un endpoint local (Floci) en vez
//     de la nube real, sin cambiar ni una línea de la lógica de negocio.
//   - Un ciclo completo de escritura (putObject) y lectura (listObjectsV2) sobre S3.
//   - Manejo de los errores más comunes que vas a encontrar en el laboratorio.

import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class FlociS3Example {
  public static void main(String[] args) {
    // S3Client es el mismo cliente que usarías contra AWS real. La única diferencia
    // para trabajar contra Floci es este bloque de configuración:
    S3Client s3 = S3Client.builder()
        // endpointOverride reemplaza el endpoint real de AWS (s3.amazonaws.com) por
        // el endpoint local donde escucha Floci. Sin esto, el SDK intentaría conectar
        // a la nube real y fallaría porque las credenciales de abajo no son válidas ahí.
        .endpointOverride(URI.create("http://localhost:4566"))
        // La región es obligatoria para que el SDK firme las peticiones (SigV4),
        // pero Floci acepta cualquier región válida; us-east-1 es la convención del curso.
        .region(Region.US_EAST_1)
        // Floci no valida credenciales reales: cualquier par no vacío funciona.
        // "test"/"test" es la convención que usa todo el curso para reconocerlas
        // de un vistazo como credenciales locales, nunca de producción.
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        // S3 real soporta direccionamiento virtual-hosted (bucket.s3.amazonaws.com) y
        // por-path (s3.amazonaws.com/bucket). Floci solo implementa el segundo, así
        // que forcePathStyle(true) es obligatorio o las peticiones fallarán con DNS
        // errors al intentar resolver un subdominio que no existe.
        .forcePathStyle(true)
        .build();

    try {
      // putObject sube un objeto nuevo. Un "objeto" en S3 es simplemente un par
      // clave-valor: la clave ("saludos/java.txt") funciona como una ruta de archivo
      // aunque S3 no tiene carpetas reales, solo claves con "/" que se muestran como
      // si fueran jerarquía.
      s3.putObject(
          PutObjectRequest.builder()
              .bucket("curso-cloud-local") // El bucket debe existir antes de escribir.
              .key("saludos/java.txt")
              .build(),
          RequestBody.fromString("Hola desde Java y Floci\n"));
      System.out.println("Objeto subido: saludos/java.txt");

      // listObjectsV2 confirma que Floci recibió y persistió la escritura anterior.
      // Es la misma llamada que usarías para auditar o listar el contenido de
      // cualquier bucket real. La respuesta incluye, entre otros campos, la lista
      // "contents" con cada objeto (clave, tamaño, fecha de modificación).
      System.out.println("Objetos en el bucket:");
      System.out.println(s3.listObjectsV2(
          ListObjectsV2Request.builder().bucket("curso-cloud-local").build()));
    } catch (Exception error) {
      // Errores frecuentes al ejecutar este ejemplo, y cómo diagnosticarlos:
      //   NoSuchBucket        -> el bucket "curso-cloud-local" no existe todavía;
      //                          créalo con: aws s3 mb s3://curso-cloud-local
      //                          --endpoint-url http://localhost:4566
      //   Connection refused  -> Floci no está corriendo; levántalo con
      //                          docker compose up -d y espera a que el health
      //                          check responda "available".
      //   SignatureDoesNotMatch -> revisa que la región sea us-east-1 y que las
      //                          credenciales sean exactamente "test"/"test".
      System.err.println("Fallo controlado en Floci: " + error.getMessage());
      throw error;
    } finally {
      // Cerrar el cliente libera las conexiones HTTP subyacentes. Es una buena
      // práctica hacerlo siempre, tanto contra Floci como contra AWS real.
      s3.close();
    }
  }
}
