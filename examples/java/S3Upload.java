// Sube un archivo local a un bucket S3 en Floci.
// Uso: java S3Upload <bucket> <ruta-local> [clave-destino]
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

public class S3Upload {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java S3Upload <bucket> <ruta-local> [clave-destino]");
    }
    String bucket = args[0];
    Path filePath = Paths.get(args[1]);
    String key = args.length > 2 ? args[2] : filePath.getFileName().toString();

    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      s3.putObject(req -> req.bucket(bucket).key(key), RequestBody.fromFile(filePath));
      System.out.println("Subido: " + filePath + " -> s3://" + bucket + "/" + key);
    } finally {
      s3.close();
    }
  }
}
