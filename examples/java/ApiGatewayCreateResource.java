// Crea un recurso (ruta) /tareas bajo el recurso raíz de una API REST.
// Uso: java ApiGatewayCreateResource <api-id> [ruta]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.apigateway.ApiGatewayClient;

public class ApiGatewayCreateResource {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java ApiGatewayCreateResource <api-id> [ruta]");
    }
    String apiId = args[0];
    String nuevaRuta = args.length > 1 ? args[1] : "tareas";

    ApiGatewayClient apigateway = ApiGatewayClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var root = apigateway.getResources(req -> req.restApiId(apiId)).items().stream()
          .filter(r -> "/".equals(r.path()))
          .findFirst()
          .orElseThrow(() -> new IllegalStateException("No se encontró el recurso raíz \"/\" de la API"));

      var created = apigateway.createResource(req -> req
          .restApiId(apiId).parentId(root.id()).pathPart(nuevaRuta));

      System.out.println("Recurso creado: /" + nuevaRuta);
      System.out.println("Resource ID: " + created.id());
      System.out.println("Siguiente paso: java ApiGatewayPutMethod " + apiId + " " + created.id());
    } finally {
      apigateway.close();
    }
  }
}
