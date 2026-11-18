"""Contrato didáctico SOAP 1.2: solo literales locales confiables."""
import xml.etree.ElementTree as ET

SOAP = "http://www.w3.org/2003/05/soap-envelope"
RUTA = "urn:rutaflow:entregas"
MENSAJE = f"""<s:Envelope xmlns:s="{SOAP}" xmlns:r="{RUTA}">
<s:Body><r:ConsultarEnvio><r:id>ENV-42</r:id></r:ConsultarEnvio></s:Body>
</s:Envelope>"""


def consultar_id(mensaje: str) -> str:
    raiz = ET.fromstring(mensaje)
    if raiz.tag != f"{{{SOAP}}}Envelope":
        raise ValueError("Se requiere Envelope SOAP 1.2")
    body = raiz.find(f"{{{SOAP}}}Body")
    if body is None:
        raise ValueError("Falta Body SOAP 1.2")
    if body.find(f"{{{SOAP}}}Fault") is not None:
        raise ValueError("Respuesta SOAP Fault: no traducir como éxito")
    envio = body.findtext(f"{{{RUTA}}}ConsultarEnvio/{{{RUTA}}}id")
    if envio is None or not envio.strip():
        raise ValueError("Falta id del envío")
    return envio.strip()


if __name__ == "__main__":
    print(f"Consultar envío: {consultar_id(MENSAJE)}")
