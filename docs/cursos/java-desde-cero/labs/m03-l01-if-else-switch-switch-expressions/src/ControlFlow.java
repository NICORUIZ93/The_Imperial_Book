public class ControlFlow {
  static String clasificar(int n){
    if(n<0) return "negativo";
    else if(n==0) return "cero";
    return "positivo";
  }
  static String dia(int n){
    return switch(n){
      case 1 -> "lunes";
      case 2 -> "martes";
      default -> "otro";
    };
  }
  public static void main(String[] args){
    System.out.println(clasificar(-1));
    System.out.println(clasificar(0));
    System.out.println(clasificar(5));
    System.out.println(dia(1));
    System.out.println(dia(9));
  }
}
