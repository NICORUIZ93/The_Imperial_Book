// Recorre TODA la tabla, con un filtro opcional. Más costoso que Query: usar con cuidado.
// Uso: java DynamoDbScan <tabla> [estado]
import java.net.URI;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

public class DynamoDbScan {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java DynamoDbScan <tabla> [estado]");
    }
    String tableName = args[0];
    String estado = args.length > 1 ? args[1] : null;

    DynamoDbClient dynamodb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      ScanRequest.Builder builder = ScanRequest.builder().tableName(tableName);
      if (estado != null) {
        // FilterExpression se aplica DESPUÉS de leer cada item de la tabla completa: no
        // reduce el costo de lectura (RCU), solo lo que se devuelve.
        builder = builder
            .filterExpression("estado = :estado")
            .expressionAttributeValues(Map.of(":estado", AttributeValue.builder().s(estado).build()));
      }

      ScanResponse result = dynamodb.scan(builder.build());
      System.out.println(result.count() + " item(s) (de " + result.scannedCount() + " escaneado(s) en total):");
      System.out.println(result.items());
      if (result.lastEvaluatedKey() != null && !result.lastEvaluatedKey().isEmpty()) {
        System.out.println("\nHay más resultados: pagina con exclusiveStartKey usando lastEvaluatedKey.");
      }
    } finally {
      dynamodb.close();
    }
  }
}
