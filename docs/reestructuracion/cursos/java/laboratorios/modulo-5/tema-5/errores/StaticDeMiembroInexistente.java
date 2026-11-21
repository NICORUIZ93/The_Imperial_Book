// Java · M5 · Tema 5 · error 14
// Un single-static-import exige que el MIEMBRO exista y sea accesible; no basta con acertar el paquete.
package prueba;

import static bodega.Envio.noExiste;

public class StaticDeMiembroInexistente {}
