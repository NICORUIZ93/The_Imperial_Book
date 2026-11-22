package com.academia.ioc;
import org.springframework.stereotype.Repository;
@Repository
public class GreetingRepository {
    public String findGreeting() { return "Hola desde repositorio"; }
}
