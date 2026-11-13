import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class ClienteDeadline {
  private ClienteDeadline() { }

  public static void main(String[] args) throws Exception {
    long budget = Long.parseLong(args[0]);
    long deadline = System.currentTimeMillis() + budget;
    var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8082/cotizar"))
        .header("X-Deadline-Epoch-Millis", Long.toString(deadline))
        .GET()
        .build();
    try (var client = HttpClient.newHttpClient()) {
      var response = client.send(request, HttpResponse.BodyHandlers.ofString());
      System.out.printf("HTTP_%d %s%n", response.statusCode(), response.body());
    }
  }
}
