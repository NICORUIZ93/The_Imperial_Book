// Descarga un objeto de S3 a un archivo local.
// Uso: java S3Download <bucket> <clave> [ruta-destino]
import java.net.URI;
import java.nio.file.Paths;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

public class S3Download {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java S3Download <bucket> <clave> [ruta-destino]");
    }
    String bucket = args[0];
    String key = args[1];
    String output = args.length > 2 ? args[2] : key.substring(key.lastIndexOf('/') + 1);

    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      s3.getObject(req -> req.bucket(bucket).key(key), Paths.get(output));
      System.out.println("Descargado: s3://" + bucket + "/" + key + " -> " + output);
    } catch (NoSuchKeyException e) {
      System.out.println("No existe el objeto \"" + key + "\" en el bucket \"" + bucket + "\".");
    } finally {
      s3.close();
    }
  }
}
