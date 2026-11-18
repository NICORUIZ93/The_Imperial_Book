// Crea una cola SQS en Floci.
// Requiere: software.amazon.awssdk:sqs
// Uso: java SqsCreateQueue [nombre-de-cola]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;

public class SqsCreateQueue {
  public static void main(String[] args) {
    String queueName = args.length > 0 ? args[0] : "mi-cola-" + System.currentTimeMillis();

    SqsClient sqs = SqsClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = sqs.createQueue(req -> req.queueName(queueName));
      System.out.println("Cola creada: " + queueName);
      System.out.println("URL: " + result.queueUrl());
    } finally {
      sqs.close();
    }
  }
}
