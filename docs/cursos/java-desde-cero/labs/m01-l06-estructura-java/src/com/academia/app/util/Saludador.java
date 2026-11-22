package com.academia.app.util;

public class Saludador {
  private final String nombre;
  public Saludador(String nombre) { this.nombre = nombre; }
  public String saludar() { return "Hola desde " + nombre; }
}
