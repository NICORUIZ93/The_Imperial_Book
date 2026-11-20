from pathlib import Path
import hashlib
import json
import shutil

original = Path('envios.json')
backup = Path('envios.backup.json')
restored = Path('restaurado.json')
original.write_text('[{"id": "ENV-42", "estado": "creado"}]', encoding='utf-8')
shutil.copy2(original, backup)
expected = hashlib.sha256(original.read_bytes()).hexdigest()
# El destino separado evita sobrescribir datos activos.
shutil.copy2(backup, restored)
assert hashlib.sha256(restored.read_bytes()).hexdigest() == expected
rows = json.loads(restored.read_text(encoding='utf-8'))
assert rows[0]['id'] == 'ENV-42'
assert rows[0]['estado'] == 'creado'
print('Contenido y estructura recuperados: ENV-42')
# También comprobamos que una copia alterada se detecta.
backup.write_text('[]', encoding='utf-8')
assert hashlib.sha256(backup.read_bytes()).hexdigest() != expected
print('Corrupción detectada')
