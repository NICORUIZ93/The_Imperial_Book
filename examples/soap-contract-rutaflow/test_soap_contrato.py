import unittest
from soap_contrato import MENSAJE, SOAP, consultar_id


class ContratoTest(unittest.TestCase):
    def test_extrae_identificador(self):
        self.assertEqual(consultar_id(MENSAJE), "ENV-42")

    def test_prefijo_no_cambia_identidad(self):
        otro = MENSAJE.replace("xmlns:s=", "xmlns:env=").replace("<s:", "<env:").replace("</s:", "</env:")
        self.assertEqual(consultar_id(otro), "ENV-42")

    def test_rechaza_version_y_id_vacio(self):
        with self.assertRaisesRegex(ValueError, "SOAP 1.2"):
            consultar_id(MENSAJE.replace(SOAP, "http://schemas.xmlsoap.org/soap/envelope/"))
        with self.assertRaisesRegex(ValueError, "Falta id"):
            consultar_id(MENSAJE.replace("ENV-42", "  "))

    def test_fault_no_se_convierte_en_exito(self):
        fallo = f'<s:Envelope xmlns:s="{SOAP}"><s:Body><s:Fault><s:Reason>Rechazado</s:Reason></s:Fault></s:Body></s:Envelope>'
        with self.assertRaisesRegex(ValueError, "Fault"):
            consultar_id(fallo)


if __name__ == "__main__":
    unittest.main()
