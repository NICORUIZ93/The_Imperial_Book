// Crea un bucket S3 nuevo en Floci.
// Uso: java S3CreateBucket [nombre-del-bucket]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;

public class S3CreateBucket {
  public static void main(String[] args) {
    String bucketName = args.length > 0 ? args[0] : "mi-bucket-" + System.currentTimeMillis();

    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .forcePathStyle(true)
        .build();

    try {
      s3.createBucket(req -> req.bucket(bucketName));
      System.out.println("Bucket creado: " + bucketName);
    } catch (BucketAlreadyOwnedByYouException e) {
      System.out.println("El bucket \"" + bucketName + "\" ya existe. Elige otro nombre o elimínalo primero.");
    } finally {
      s3.close();
    }
  }
}
