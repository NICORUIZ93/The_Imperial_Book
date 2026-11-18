// Invoca una función Lambda de forma síncrona y muestra su respuesta.
// Uso: java LambdaInvoke <nombre-funcion> [json-de-entrada]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.ResourceNotFoundException;

public class LambdaInvoke {
  public static void main(String[] args) {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java LambdaInvoke <nombre-funcion> [json-de-entrada]");
    }
    String functionName = args[0];
    String payload = args.length > 1 ? args[1] : "{\"origen\":\"LambdaInvoke\"}";

    LambdaClient lambda = LambdaClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = lambda.invoke(req -> req
          .functionName(functionName)
          .payload(SdkBytes.fromUtf8String(payload)));

      System.out.println("Status code HTTP de la invocación: " + result.statusCode());
      if (result.functionError() != null) {
        System.out.println("La función terminó con error: " + result.functionError());
      }
      System.out.println("Respuesta: " + result.payload().asUtf8String());
    } catch (ResourceNotFoundException e) {
      System.out.println("No existe la función \"" + functionName + "\". Créala primero con LambdaCreateFunction.");
    } finally {
      lambda.close();
    }
  }
}
