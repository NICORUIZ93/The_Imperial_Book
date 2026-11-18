// Actualiza el atributo "estado" de un item existente sin sobrescribir el resto.
// Uso: java DynamoDbUpdateItem <tabla> <id> <nuevo-estado>
import java.net.URI;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ReturnValue;

public class DynamoDbUpdateItem {
  public static void main(String[] args) {
    if (args.length < 3) {
      throw new IllegalArgumentException("Uso: java DynamoDbUpdateItem <tabla> <id> <nuevo-estado>");
    }
    String tableName = args[0];
    String id = args[1];
    String nuevoEstado = args[2];

    DynamoDbClient dynamodb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = dynamodb.updateItem(req -> req
          .tableName(tableName)
          .key(Map.of("id", AttributeValue.builder().s(id).build()))
          .updateExpression("SET estado = :nuevoEstado")
          .expressionAttributeValues(Map.of(":nuevoEstado", AttributeValue.builder().s(nuevoEstado).build()))
          .returnValues(ReturnValue.ALL_NEW));
      System.out.println("Item actualizado: " + result.attributes());
    } finally {
      dynamodb.close();
    }
  }
}
