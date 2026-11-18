// Crea una tabla DynamoDB con clave primaria simple "id".
// Requiere: software.amazon.awssdk:dynamodb
// Uso: java DynamoDbCreateTable [nombre-tabla]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeDefinition;
import software.amazon.awssdk.services.dynamodb.model.BillingMode;
import software.amazon.awssdk.services.dynamodb.model.KeySchemaElement;
import software.amazon.awssdk.services.dynamodb.model.KeyType;
import software.amazon.awssdk.services.dynamodb.model.ScalarAttributeType;

public class DynamoDbCreateTable {
  public static void main(String[] args) {
    String tableName = args.length > 0 ? args[0] : "MiTabla" + System.currentTimeMillis();

    DynamoDbClient dynamodb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      dynamodb.createTable(req -> req
          .tableName(tableName)
          .attributeDefinitions(AttributeDefinition.builder()
              .attributeName("id").attributeType(ScalarAttributeType.S).build())
          .keySchema(KeySchemaElement.builder()
              .attributeName("id").keyType(KeyType.HASH).build())
          .billingMode(BillingMode.PAY_PER_REQUEST));

      dynamodb.waiter().waitUntilTableExists(req -> req.tableName(tableName));
      System.out.println("Tabla creada y activa: " + tableName);
    } finally {
      dynamodb.close();
    }
  }
}
