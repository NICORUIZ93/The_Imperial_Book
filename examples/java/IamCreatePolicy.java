// Crea una política IAM de solo lectura sobre un bucket S3 específico
// (principio de mínimo privilegio, no AdministratorAccess).
// Uso: java IamCreatePolicy <nombre-politica> <nombre-bucket>
import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.iam.IamClient;

public class IamCreatePolicy {
  public static void main(String[] args) {
    if (args.length < 2) {
      throw new IllegalArgumentException("Uso: java IamCreatePolicy <nombre-politica> <nombre-bucket>");
    }
    String policyName = args[0];
    String bucketName = args[1];

    String document = """
        {
          "Version": "2012-10-17",
          "Statement": [{
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": ["arn:aws:s3:::%s", "arn:aws:s3:::%s/*"]
          }]
        }
        """.formatted(bucketName, bucketName);

    IamClient iam = IamClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      var result = iam.createPolicy(req -> req.policyName(policyName).policyDocument(document));
      System.out.println("Política creada: " + result.policy().policyName());
      System.out.println("ARN: " + result.policy().arn());
      System.out.println("Siguiente paso: java IamAttachPolicy <usuario> " + result.policy().arn());
    } finally {
      iam.close();
    }
  }
}
