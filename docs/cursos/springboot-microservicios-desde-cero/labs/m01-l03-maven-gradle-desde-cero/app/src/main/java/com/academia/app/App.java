package com.academia.app;
import com.academia.domain.GreetingService;
public class App {
    public String run(String name) { return new GreetingService().greet(name); }
    public static void main(String[] args) { System.out.println(new App().run(args.length>0?args[0]:"Mundo")); }
}
