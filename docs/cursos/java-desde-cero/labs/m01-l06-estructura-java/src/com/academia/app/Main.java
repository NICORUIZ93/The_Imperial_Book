package com.academia.app;

import com.academia.app.util.Saludador;

public class Main {
  public static void main(String[] args) {
    Saludador s = new Saludador("Academia");
    System.out.println(s.saludar());
  }
}
