public class Adivinanza {
  static String evaluar(int secreto, int intento){
    if(intento == secreto) return "correcto";
    if(intento < secreto) return "muy bajo";
    return "muy alto";
  }
  public static void main(String[] args){
    int secreto = 7;
    int[] intentos = {3,9,7};
    for(int i: intentos){
      System.out.println(evaluar(secreto,i));
    }
  }
}
