// Java · M5 · Tema 5 · error 12
// Dos import-on-demand que ofrecen el mismo nombre conviven sin queja: el error aparece al USAR el nombre
// (JLS 7.5.3), y el mensaje dice exactamente los dos candidatos.
package prueba;

import java.util.*;
import java.sql.*;

public class FechaAmbigua {
    Date cuando;
}
