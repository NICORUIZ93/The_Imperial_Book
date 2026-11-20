"""Tests de los simuladores del Módulo 4 (necesitan los Redis de docker-compose.yml).

Uso:  python3 -m unittest -v test_simuladores      (desde esta carpeta)
"""
import threading
import unittest

import patrones
import redlock_fencing
import stampede
from resp import conectar


class PatronesTest(unittest.TestCase):
    def setUp(self):
        self.r = conectar()

    def tearDown(self):
        self.r.cerrar()

    def test_read_through_consulta_la_base_una_sola_vez(self):
        rt = patrones.demo_read_through(self.r)
        self.assertEqual(["MISS", "HIT", "HIT"], rt["estados"])
        self.assertEqual(1, rt["lecturas_bd"])

    def test_write_through_deja_cache_y_base_iguales(self):
        wt = patrones.demo_write_through(self.r)
        self.assertEqual(("Teclado|120", "HIT"), (wt["valor"], wt["estado"]))
        self.assertEqual("Teclado|120", wt["precio_bd"])

    def test_write_behind_agrupa_101_cambios_en_una_escritura(self):
        wb = patrones.demo_write_behind(self.r)
        self.assertEqual("Teclado|100", wb["antes"]["bd"])      # la base va por detrás
        self.assertEqual(101, wb["antes"]["pendientes"])
        self.assertEqual("Teclado|200", wb["despues"]["bd"])
        self.assertEqual(1, wb["escrituras_bd"])


class RedlockTest(unittest.TestCase):
    def test_quorum_de_dos_sobre_tres(self):
        a, b, c = redlock_fencing.escenario_mayoria()
        self.assertEqual((3, 2, 1), (a["nodos"], b["nodos"], c["nodos"]))
        self.assertIsNotNone(a["valor"]); self.assertIsNotNone(b["valor"]); self.assertIsNone(c["valor"])

    def test_sin_fencing_la_escritura_tardia_pisa_a_b(self):
        s = redlock_fencing.escenario_pausa(con_fencing=False)
        self.assertEqual("total=100 (A, tarde)", s["final"])

    def test_con_fencing_el_almacen_rechaza_el_token_viejo(self):
        s = redlock_fencing.escenario_pausa(con_fencing=True)
        self.assertLess(s["token_a"], s["token_b"])
        self.assertEqual((1, 0), (s["acepta_b"], s["acepta_a"]))
        self.assertEqual("total=200 (B)", s["final"])
        self.assertEqual(0, s["liberados_por_a"])


class StampedeTest(unittest.TestCase):
    def test_sin_proteccion_todos_van_a_la_base(self):
        self.assertEqual(stampede.HILOS, stampede.carrera(stampede.sin_proteccion, 11)["consultas"])

    def test_con_candado_solo_uno_va_a_la_base(self):
        res = stampede.carrera(stampede.con_candado, 12)
        self.assertEqual((1, stampede.HILOS), (res["consultas"], res["respuestas"]))

    def test_si_el_ganador_muere_el_ttl_del_candado_evita_el_bloqueo_eterno(self):
        res = stampede.carrera(stampede.con_candado, 13, primer_ganador_muere=threading.Event(), ttl_candado_ms=500)
        self.assertEqual((2, stampede.HILOS - 1), (res["consultas"], res["respuestas"]))


if __name__ == "__main__":
    unittest.main()
