// Java · M5 · Tema 5 · error 26 (tercera mitad): el import estatico on-demand del vecino tampoco alcanza
// Este archivo SI escribe un import del vecino, pero por la puerta de los ESTATICOS. `Date` es un tipo de nivel
// superior de java.util, no un miembro de ConImport, asi que el nombre sigue sin verse: los mismos dos errores.
package vecinos;

import static vecinos.ConImport.*;

public class SinImportEstatico {
    Date cuando = new Date(0);
}
