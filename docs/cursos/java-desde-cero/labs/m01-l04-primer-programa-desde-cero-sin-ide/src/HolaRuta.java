public class HolaRuta {
  public static void main(String[] args) {
    String nombre = args.length > 0 ? args[0] : "mundo";
    System.out.println("Hola, " + nombre + "!");
  }
}
