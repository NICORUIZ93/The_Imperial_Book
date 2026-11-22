public class CastingDemo {
  public static void main(String[] args) {
    int i = 10;
    double d = i; // implícito
    double x = 9.7;
    int y = (int) x; // explícito
    System.out.println(d);
    System.out.println(y);
  }
}
