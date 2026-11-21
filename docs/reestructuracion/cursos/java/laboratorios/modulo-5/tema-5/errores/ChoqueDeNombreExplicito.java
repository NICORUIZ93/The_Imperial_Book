// Java · M5 · Tema 5 · error 15
// Un single-static-import puede importar un TIPO anidado (`Sello`), y si ademas importas un tipo de otro
// paquete con el mismo nombre simple, los dos pelean por el mismo hueco: la importacion estatica pierde
// y el archivo no compila (JLS 7.5.1).
package prueba;

import static bodega.Envio.Sello;
import otra.Sello;

public class ChoqueDeNombreExplicito {}
