// Crea una API REST vacía en API Gateway.
// Requiere: software.amazon.awssdk:apigateway
// Uso: java ApiGatewayCreateApi [nombre-api]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.apigateway.ApiGatewayClient;

public class ApiGatewayCreateApi {
  public static void main(String[] args) {
    String apiName = args.length > 0 ? args[0] : "mi-api";

    ApiGatewayClient apigateway = ApiGatewayClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = apigateway.createRestApi(req -> req.name(apiName));
      System.out.println("API REST creada: " + apiName);
      System.out.println("API ID: " + result.id());
      System.out.println("Siguiente paso: java ApiGatewayCreateResource " + result.id());
    } finally {
      apigateway.close();
    }
  }
}
