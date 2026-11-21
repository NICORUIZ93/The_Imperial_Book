// Java · M5 · Tema 5 · error 16
// `java.se` existe como modulo, pero es un agregado sin codigos de clase y no es legible desde el modulo
// anonimo. JLS 7.5.5: si el modulo no se lee, el import es error aunque el nombre este bien escrito.
package prueba;

import module java.se;

public class ModuloNoLeido {}
