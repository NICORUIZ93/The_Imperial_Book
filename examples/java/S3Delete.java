// Elimina un objeto de S3 (y opcionalmente el bucket si queda vacío).
// Uso: java S3Delete <bucket> <clave> [--bucket-tambien]
import java.net.URI;
import java.util.Arrays;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.S3Exception;

public class S3Delete {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java S3Delete <bucket> <clave> [--bucket-tambien]");
    }
    String bucket = args[0];
    String key = args[1];
    boolean borrarBucket = Arrays.asList(args).contains("--bucket-tambien");

    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      s3.deleteObject(req -> req.bucket(bucket).key(key));
      System.out.println("Objeto eliminado: s3://" + bucket + "/" + key);

      if (borrarBucket) {
        try {
          s3.deleteBucket(req -> req.bucket(bucket));
          System.out.println("Bucket eliminado: " + bucket);
        } catch (S3Exception e) {
          System.out.println("El bucket todavía tiene objetos. Elimínalos antes de borrar el bucket.");
        }
      }
    } finally {
      s3.close();
    }
  }
}
