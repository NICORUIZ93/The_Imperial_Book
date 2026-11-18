// Consulta items de DynamoDB por clave de partición con Query (más eficiente que Scan).
// Uso: java DynamoDbQuery <tabla> <id>
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;

public class DynamoDbQuery {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java DynamoDbQuery <tabla> <id>");
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
      // Query exige una condición de igualdad sobre la clave de partición. Con una tabla de
      // clave simple como esta, devuelve como máximo un item: su verdadera ventaja aparece
      // con una clave de ordenación o un índice secundario (GSI, ver Módulo 4).
      QueryResponse result = dynamodb.query(req -> req
          .tableName(tableName)
          .keyConditionExpression("id = :id")
          .expressionAttributeValues(java.util.Map.of(":id", AttributeValue.builder().s(id).build())));

      if (result.items().isEmpty()) {
        System.out.println("No existe ningún item con id=\"" + id + "\" en " + tableName + ".");
        return;
      }
      System.out.println(result.count() + " item(s) encontrado(s) (escaneados: " + result.scannedCount() + "):");
      System.out.println(result.items());
    } finally {
      dynamodb.close();
    }
  }
}
