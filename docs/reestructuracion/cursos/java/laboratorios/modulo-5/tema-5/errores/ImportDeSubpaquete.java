// Java · M5 · Tema 5 · error 8
// `import java.util;` importa los MIEMBROS de `java.util`, no un alias del paquete: escribir `util.Random`
// no existe en Java (eso es de otros lenguajes). JLS 7.5.2 no da nombre de paquete en scope.
package prueba;

import java.util;

public class ImportDeSubpaquete {
    util.Random r = new util.Random();
}
