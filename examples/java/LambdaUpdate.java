// Actualiza el código de una función Lambda existente y la vuelve a invocar.
// Uso: java LambdaUpdate <nombre-funcion>
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

public class LambdaUpdate {
  private static final String NUEVO_HANDLER = """
      exports.handler = async (event) => {
        return {
          statusCode: 200,
          body: JSON.stringify({ mensaje: 'Versión actualizada del handler', recibido: event }),
        };
      };
      """;

  private static byte[] buildZip() throws Exception {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    try (ZipOutputStream zip = new ZipOutputStream(buffer)) {
      zip.putNextEntry(new ZipEntry("index.js"));
      zip.write(NUEVO_HANDLER.getBytes(StandardCharsets.UTF_8));
      zip.closeEntry();
    }
    return buffer.toByteArray();
  }

  public static void main(String[] args) throws Exception {
    if (args.length < 1) {
      throw new IllegalArgumentException("Uso: java LambdaUpdate <nombre-funcion>");
    }
    String functionName = args[0];

    LambdaClient lambda = LambdaClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    try {
      lambda.updateFunctionCode(req -> req
          .functionName(functionName)
          .zipFile(SdkBytes.fromByteArray(buildZip())));
      System.out.println("Código actualizado para: " + functionName);

      var result = lambda.invoke(req -> req
          .functionName(functionName)
          .payload(SdkBytes.fromUtf8String("{\"prueba\":\"post-actualizacion\"}")));
      System.out.println("Respuesta tras actualizar: " + result.payload().asUtf8String());
    } finally {
      lambda.close();
    }
  }
}
