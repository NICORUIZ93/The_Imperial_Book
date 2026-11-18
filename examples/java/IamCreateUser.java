// Crea un usuario IAM.
// Requiere: software.amazon.awssdk:iam
// Uso: java IamCreateUser [nombre-usuario]
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.iam.IamClient;
import software.amazon.awssdk.services.iam.model.EntityAlreadyExistsException;

public class IamCreateUser {
  public static void main(String[] args) {
    String userName = args.length > 0 ? args[0] : "mi-usuario";

    IamClient iam = IamClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = iam.createUser(req -> req.userName(userName));
      System.out.println("Usuario IAM creado: " + result.user().userName());
      System.out.println("ARN: " + result.user().arn());
      System.out.println("Siguiente paso: java IamCreatePolicy");
    } catch (EntityAlreadyExistsException e) {
      System.out.println("El usuario \"" + userName + "\" ya existe.");
    } finally {
      iam.close();
    }
  }
}
