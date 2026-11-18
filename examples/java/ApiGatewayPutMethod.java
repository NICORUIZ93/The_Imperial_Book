// Añade un método GET a un recurso, con respuesta mock (sin Lambda todavía).
// Uso: java ApiGatewayPutMethod <api-id> <resource-id>
import java.net.URI;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.apigateway.ApiGatewayClient;
import software.amazon.awssdk.services.apigateway.model.IntegrationType;

public class ApiGatewayPutMethod {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java ApiGatewayPutMethod <api-id> <resource-id>");
    }
    String apiId = args[0];
    String resourceId = args[1];

    ApiGatewayClient apigateway = ApiGatewayClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      apigateway.putMethod(req -> req
          .restApiId(apiId).resourceId(resourceId).httpMethod("GET").authorizationType("NONE"));
      System.out.println("Método GET creado en el recurso.");

      // Integración MOCK: responde sin invocar ningún backend real todavía.
      apigateway.putIntegration(req -> req
          .restApiId(apiId).resourceId(resourceId).httpMethod("GET")
          .type(IntegrationType.MOCK)
          .requestTemplates(Map.of("application/json", "{\"statusCode\": 200}")));
      System.out.println("Integración MOCK configurada. Para conectar una Lambda real, usa integración AWS_PROXY.");
    } finally {
      apigateway.close();
    }
  }
}
