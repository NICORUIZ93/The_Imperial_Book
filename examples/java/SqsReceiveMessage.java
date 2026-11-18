// Recibe (hasta 10) mensajes de una cola SQS sin eliminarlos todavía.
// Uso: java SqsReceiveMessage <queue-url>
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;

public class SqsReceiveMessage {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java SqsReceiveMessage <queue-url>");
    }
    String queueUrl = args[0];

    SqsClient sqs = SqsClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var messages = sqs.receiveMessage(req -> req
          .queueUrl(queueUrl)
          .maxNumberOfMessages(10)
          .waitTimeSeconds(2)).messages();

      if (messages.isEmpty()) {
        System.out.println("No hay mensajes disponibles ahora mismo.");
        return;
      }
      System.out.println(messages.size() + " mensaje(s) recibido(s):");
      messages.forEach(m -> System.out.println("  - " + m.body()
          + " (ReceiptHandle: " + m.receiptHandle().substring(0, 20) + "...)"));
      System.out.println("\nUsa SqsDeleteMessage con el ReceiptHandle completo para confirmarlos.");
    } finally {
      sqs.close();
    }
  }
}
