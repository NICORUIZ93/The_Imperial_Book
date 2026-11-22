public class BuclesDemo {
  public static void main(String[] args){
    int sumFor=0; for(int i=1;i<=5;i++) sumFor+=i;
    int sumWhile=0; int j=1; while(j<=5){ sumWhile+=j; j++; }
    int sumDo=0; int k=1; do{ sumDo+=k; k++; }while(k<=5);
    System.out.println(sumFor);
    System.out.println(sumWhile);
    System.out.println(sumDo);
  }
}
