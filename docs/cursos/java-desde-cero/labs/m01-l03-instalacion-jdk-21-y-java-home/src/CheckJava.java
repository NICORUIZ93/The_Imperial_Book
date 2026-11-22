public class CheckJava {
  public static void main(String[] args) {
    String version = System.getProperty("java.version");
    String home = System.getProperty("java.home");
    System.out.println("JAVA_VERSION=" + version);
    System.out.println("JAVA_HOME=" + (home!=null && !home.isBlank()?"OK":"MISSING"));
  }
}
