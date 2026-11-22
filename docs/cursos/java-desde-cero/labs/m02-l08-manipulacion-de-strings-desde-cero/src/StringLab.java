public class StringLab {
  static String normalizar(String s){
    return s.trim().toLowerCase();
  }
  static boolean esEmailSimple(String s){
    String n = normalizar(s);
    int at = n.indexOf('@');
    int dot = n.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < n.length() - 1;
  }
  static String slug(String s){
    return normalizar(s).replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$","");
  }
  public static void main(String[] args){
    System.out.println(normalizar("  Hola Mundo  "));
    System.out.println(esEmailSimple(" USER@Example.com "));
    System.out.println(esEmailSimple("malo@com"));
    System.out.println(slug(" Hola, Java 21! "));
  }
}
