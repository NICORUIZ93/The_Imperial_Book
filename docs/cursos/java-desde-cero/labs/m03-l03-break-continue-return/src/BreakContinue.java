public class BreakContinue {
  public static void main(String[] args){
    int firstEven=-1;
    int sumOdd=0;
    for(int i=1;i<=6;i++){
      if(i%2==0){ firstEven=i; break; }
    }
    for(int i=1;i<=6;i++){
      if(i%2==0) continue;
      sumOdd+=i;
    }
    System.out.println(firstEven);
    System.out.println(sumOdd);
  }
}
