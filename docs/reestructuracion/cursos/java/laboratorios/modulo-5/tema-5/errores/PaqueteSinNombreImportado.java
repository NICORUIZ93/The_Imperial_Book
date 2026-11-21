// Java · M5 · Tema 5 · error 9
// Un import-on-demand termina en `.*` y un single-type-import termina en un nombre de tipo. `Rasgo` no es
// un paquete, asi que el analizador exige el punto: el paquete sin nombre NO se puede importar (JLS 7.4.2).
package prueba;

import Rasgo;

public class PaqueteSinNombreImportado {}
