// Inserta (o sobrescribe) un item en una tabla DynamoDB.
// Uso: java DynamoDbPutItem <tabla> <id> <titulo>
import java.net.URI;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

public class DynamoDbPutItem {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java DynamoDbPutItem <tabla> <id> <titulo>");
    }
    String tableName = args[0];
    String id = args[1];
    String titulo = args.length > 2 ? String.join(" ", Arrays.copyOfRange(args, 2, args.length)) : "Sin título";

    DynamoDbClient dynamodb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      Map<String, AttributeValue> item = new HashMap<>();
      item.put("id", AttributeValue.builder().s(id).build());
      item.put("titulo", AttributeValue.builder().s(titulo).build());
      item.put("estado", AttributeValue.builder().s("pendiente").build());
      item.put("creado", AttributeValue.builder().n(String.valueOf(System.currentTimeMillis())).build());

      dynamodb.putItem(req -> req.tableName(tableName).item(item));
      System.out.println("Item insertado en " + tableName + ": id=" + id + ", titulo=\"" + titulo + "\"");
    } finally {
      dynamodb.close();
    }
  }
}
