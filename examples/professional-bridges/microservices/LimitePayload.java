import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.EOFException;
import java.nio.charset.StandardCharsets;

public final class LimitePayload {
  private static final int MAX_BYTES = 32;
  private LimitePayload() { }
  public static void main(String[] args) throws Exception {
    byte[] payload = args[0].getBytes(StandardCharsets.UTF_8);
    var buffer = new java.io.ByteArrayOutputStream();
    try (var output = new DataOutputStream(buffer)) {
      output.writeInt(payload.length);
      output.write(payload);
    }
    try (var input = new DataInputStream(new java.io.ByteArrayInputStream(buffer.toByteArray()))) {
      int length = input.readInt();
      if (length < 0 || length > MAX_BYTES) throw new IllegalArgumentException("PAYLOAD_EXCESIVO");
      byte[] body = input.readNBytes(length);
      if (body.length != length) throw new EOFException("FRAME_INCOMPLETO");
      System.out.println("FRAME_OK bytes=" + body.length + " texto=" + new String(body, StandardCharsets.UTF_8));
    }
  }
}
