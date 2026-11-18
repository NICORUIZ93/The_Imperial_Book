// Despliega una API REST a un stage, dejándola accesible por HTTP.
// Uso: java ApiGatewayDeploy <api-id> [stage]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.apigateway.ApiGatewayClient;

public class ApiGatewayDeploy {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java ApiGatewayDeploy <api-id> [stage]");
    }
    String apiId = args[0];
    String stage = args.length > 1 ? args[1] : "dev";

    ApiGatewayClient apigateway = ApiGatewayClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      // CreateDeployment congela una "foto" de los recursos/métodos actuales de la API y la
      // publica bajo un stage. Sin este paso, los métodos configurados con ApiGatewayPutMethod
      // solo existen en la definición de la API, pero no son alcanzables por HTTP todavía.
      apigateway.createDeployment(req -> req.restApiId(apiId).stageName(stage));

      String invokeUrl = "http://localhost:4566/restapis/" + apiId + "/" + stage + "/_user_request_";
      System.out.println("API desplegada en el stage \"" + stage + "\".");
      System.out.println("URL de invocación: " + invokeUrl);
      System.out.println("Prueba con: curl " + invokeUrl + "/tareas");
    } finally {
      apigateway.close();
    }
  }
}
