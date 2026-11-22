import java.util.*;
public class WrappersDemo {
  public static void main(String[] args){
    Integer a = 10; // autoboxing
    int b = a; // unboxing
    List<Integer> nums = new ArrayList<>();
    nums.add(1); nums.add(2);
    System.out.println(b);
    System.out.println(Integer.parseInt("42"));
    System.out.println(nums.size());
  }
}
