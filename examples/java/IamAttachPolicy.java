// Asigna (adjunta) una política IAM a un usuario.
// Uso: java IamAttachPolicy <nombre-usuario> <arn-politica>
import java.net.URI;
import java.util.stream.Collectors;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.iam.IamClient;

public class IamAttachPolicy {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java IamAttachPolicy <nombre-usuario> <arn-politica>");
    }
    String userName = args[0];
    String policyArn = args[1];

    IamClient iam = IamClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      iam.attachUserPolicy(req -> req.userName(userName).policyArn(policyArn));
      System.out.println("Política " + policyArn + " asignada a " + userName + ".");

      var attached = iam.listAttachedUserPolicies(req -> req.userName(userName));
      String names = attached.attachedPolicies().stream()
          .map(p -> p.policyName())
          .collect(Collectors.joining(", "));
      System.out.println("Políticas actualmente asignadas: " + names);
    } finally {
      iam.close();
    }
  }
}
