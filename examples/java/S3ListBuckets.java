// Lista todos los buckets S3 existentes en Floci.
// Requiere: software.amazon.awssdk:s3 (AWS SDK for Java v2).
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

public class S3ListBuckets {
  public static void main(String[] args) {
    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      var buckets = s3.listBuckets().buckets();
      if (buckets.isEmpty()) {
        System.out.println("No hay buckets todavía. Crea uno con S3CreateBucket.");
        return;
      }
      System.out.println("Buckets:");
      buckets.forEach(b -> System.out.println("  - " + b.name() + " (creado " + b.creationDate() + ")"));
    } finally {
      s3.close();
    }
  }
}
