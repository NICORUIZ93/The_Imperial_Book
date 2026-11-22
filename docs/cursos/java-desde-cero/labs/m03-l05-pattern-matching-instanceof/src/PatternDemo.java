public class PatternDemo {
  static String describir(Object o){
    if(o instanceof String s) return "str:" + s.length();
    if(o instanceof Integer i) return "int:" + (i*2);
    return "otro";
  }
  public static void main(String[] args){
    System.out.println(describir("hola"));
    System.out.println(describir(21));
    System.out.println(describir(3.5));
  }
}
