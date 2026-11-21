// Java · M5 · Tema 5 · error 18
// Una unidad de compilacion ORDINARIA (con declaracion de tipo) no importa `module java.base` de forma
// implicita: eso solo pasa en la forma compacta. Aqui `List` no se ve y hay que escribir el import.
package prueba;

import java.util.ArrayList;

public class ListaSinImport {
    List<String> v = new ArrayList<>();
}
