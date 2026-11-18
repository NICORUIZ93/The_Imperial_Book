// Elimina una función Lambda.
// Uso: java LambdaDelete <nombre-funcion>
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.ResourceNotFoundException;

public class LambdaDelete {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java LambdaDelete <nombre-funcion>");
    }
    String functionName = args[0];

    LambdaClient lambda = LambdaClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      lambda.deleteFunction(req -> req.functionName(functionName));
      System.out.println("Función eliminada: " + functionName);
    } catch (ResourceNotFoundException e) {
      System.out.println("No existe la función \"" + functionName + "\" (o ya fue eliminada).");
    } finally {
      lambda.close();
    }
  }
}
