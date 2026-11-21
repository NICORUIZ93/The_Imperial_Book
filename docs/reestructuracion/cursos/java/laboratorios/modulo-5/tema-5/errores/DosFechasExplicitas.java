// Java · M5 · Tema 5 · error 11
// Dos single-type-import con el MISMO nombre simple son error de compilacion en el segundo (JLS 7.5.1),
// aunque nunca uses el nombre. La ambiguedad se declara, no se descubre al usarla.
package prueba;

import java.util.Date;
import java.sql.Date;

public class DosFechasExplicitas {}
