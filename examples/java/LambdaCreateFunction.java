// Empaqueta un handler mínimo y despliega una función Lambda en Floci.
// Requiere: software.amazon.awssdk:lambda (usa java.util.zip del JDK, sin dependencias extra).
// Uso: java LambdaCreateFunction [nombre-funcion]
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.FunctionCode;
import software.amazon.awssdk.services.lambda.model.Runtime;

public class LambdaCreateFunction {
  private static final String HANDLER_CODE = """
      exports.handler = async (event) => {
        return {
          statusCode: 200,
          body: JSON.stringify({ mensaje: 'Hola desde Lambda en Floci', recibido: event }),
        };
      };
      """;

  private static byte[] buildZip() throws Exception {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    try (ZipOutputStream zip = new ZipOutputStream(buffer)) {
      zip.putNextEntry(new ZipEntry("index.js"));
      zip.write(HANDLER_CODE.getBytes(StandardCharsets.UTF_8));
      zip.closeEntry();
    }
    return buffer.toByteArray();
  }

  public static void main(String[] args) throws Exception {
    String functionName = args.length > 0 ? args[0] : "mi-funcion";

    LambdaClient lambda = LambdaClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      lambda.createFunction(req -> req
          .functionName(functionName)
          .runtime(Runtime.NODEJS20_X)
          .role("arn:aws:iam::000000000000:role/lambda-role")
          .handler("index.handler")
          .code(FunctionCode.builder().zipFile(SdkBytes.fromByteArray(buildZip())).build()));

      System.out.println("Función Lambda creada: " + functionName);
      System.out.println("Invócala con: java LambdaInvoke " + functionName);
    } finally {
      lambda.close();
    }
  }
}
