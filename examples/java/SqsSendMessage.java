// Envía un mensaje a una cola SQS.
// Uso: java SqsSendMessage <queue-url> <texto-del-mensaje>
import java.net.URI;
import java.util.Arrays;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;

public class SqsSendMessage {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java SqsSendMessage <queue-url> <texto-del-mensaje>");
    }
    String queueUrl = args[0];
    String messageBody = String.join(" ", Arrays.copyOfRange(args, 1, args.length));

    SqsClient sqs = SqsClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = sqs.sendMessage(req -> req.queueUrl(queueUrl).messageBody(messageBody));
      System.out.println("Mensaje enviado. MessageId: " + result.messageId());
    } finally {
      sqs.close();
    }
  }
}
