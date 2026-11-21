// Java · M5 · Tema 5 · error 25
// Un import on-demand de un paquete que no existe se corta AL ESCRIBIRLO, no al usar un nombre de el:
// a diferencia de `FechaAmbigua.java`, aqui no hay ninguna ambiguedad que esperar.
package prueba;

import no.existe.*;

public class OnDemandInexistente {}
