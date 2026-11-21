// Java · M5 · Tema 5 · error 28
// §7.6: la regla del nombre de archivo implica AT MOST ONE public type per compilation unit. Aquí los dos
// son públicos y el archivo se llama ni como el uno ni como el otro: javac corta los dos renglones.
package prueba;

public class UnaPublica {}

public class OtraPublica {}
