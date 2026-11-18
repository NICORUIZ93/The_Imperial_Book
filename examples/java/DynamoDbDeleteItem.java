// Elimina un item de DynamoDB por su clave primaria.
// Uso: java DynamoDbDeleteItem <tabla> <id>
import java.net.URI;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

public class DynamoDbDeleteItem {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java DynamoDbDeleteItem <tabla> <id>");
    }
    String tableName = args[0];
    String id = args[1];

    DynamoDbClient dynamodb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      dynamodb.deleteItem(req -> req
          .tableName(tableName)
          .key(Map.of("id", AttributeValue.builder().s(id).build())));
      System.out.println("Item id=\"" + id + "\" eliminado de " + tableName + ".");
    } finally {
      dynamodb.close();
    }
  }
}
