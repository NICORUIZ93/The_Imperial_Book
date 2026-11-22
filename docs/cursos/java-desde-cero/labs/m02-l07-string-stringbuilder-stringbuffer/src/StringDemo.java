public class StringDemo {
  public static void main(String[] args) {
    String a = "hola";
    String b = a + " mundo";
    StringBuilder sb = new StringBuilder();
    sb.append("java").append("-").append(21);
    StringBuffer sbf = new StringBuffer();
    sbf.append("seguro");
    System.out.println(b);
    System.out.println(sb.toString());
    System.out.println(sbf.toString());
    System.out.println(a == "hola");
  }
}
