// Elimina (confirma el procesamiento de) un mensaje de una cola SQS.
// Uso: java SqsDeleteMessage <queue-url> <receipt-handle>
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;

public class SqsDeleteMessage {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java SqsDeleteMessage <queue-url> <receipt-handle>");
    }
    String queueUrl = args[0];
    String receiptHandle = args[1];

    SqsClient sqs = SqsClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      sqs.deleteMessage(req -> req.queueUrl(queueUrl).receiptHandle(receiptHandle));
      System.out.println("Mensaje eliminado de la cola.");
    } finally {
      sqs.close();
    }
  }
}
