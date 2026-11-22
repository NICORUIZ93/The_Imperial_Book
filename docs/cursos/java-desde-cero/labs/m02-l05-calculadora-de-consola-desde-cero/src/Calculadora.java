public class Calculadora {
  public static int sumar(int a,int b){ return a+b; }
  public static int restar(int a,int b){ return a-b; }
  public static int multiplicar(int a,int b){ return a*b; }
  public static int dividir(int a,int b){
    if(b==0) throw new IllegalArgumentException("division por cero");
    return a/b;
  }
  public static void main(String[] args){
    if(args.length<3){ System.out.println("USO: op a b"); return; }
    String op=args[0]; int a=Integer.parseInt(args[1]); int b=Integer.parseInt(args[2]);
    int r=switch(op){
      case "sumar" -> sumar(a,b);
      case "restar" -> restar(a,b);
      case "mult" -> multiplicar(a,b);
      case "div" -> dividir(a,b);
      default -> throw new IllegalArgumentException("op invalida");
    };
    System.out.println(r);
  }
}
