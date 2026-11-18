import unittest
from ruta import ruta_url, interpretar

class RutaTest(unittest.TestCase):
    def test_orden_longitud_latitud_y_unidades(self):
        self.assertIn('13.0,52.0;14.0,53.0', ruta_url('http://localhost:5000', [(13.0,52.0),(14.0,53.0)]))
        payload={'code':'Ok','routes':[{'distance':1500,'duration':300,
            'geometry':{'type':'LineString','coordinates':[[13,52],[14,53]]}}]}
        self.assertEqual((1500,300), interpretar(payload))
    def test_sin_ruta_no_es_distancia_cero(self):
        with self.assertRaises(ValueError): interpretar({'code':'NoRoute','routes':[]})
        with self.assertRaises(ValueError): ruta_url('http://localhost:5000',[(0,91),(0,0)])

if __name__=='__main__':unittest.main()
