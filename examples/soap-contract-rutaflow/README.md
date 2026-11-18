# Contrato local SOAP · RutaFlow

Python 3, sin dependencias. Desde esta carpeta:

```bash
python3 soap_contrato.py
python3 -m unittest -v
```

Salida: `Consultar envío: ENV-42` y cuatro pruebas correctas.
Solo analiza literales confiables: no exponer como endpoint ni usar como parser
seguro de XML externo. No valida esquema, WSDL, cardinalidad completa, cabeceras,
HTTP, autenticación ni interoperabilidad. La prueba de Fault usa un mensaje
mínimo para verificar el rechazo, no un Fault completo conforme a esquema.

Referencia: https://www.w3.org/TR/soap12-part1/
