from pathlib import Path
import subprocess
import sys

Path('v1.py').write_text('print("ENV-42 listo")\n', encoding='utf-8')
Path('v2.py').write_text('raise RuntimeError("configuración inválida")\n', encoding='utf-8')
active = Path('active.txt')
active.write_text('v1.py', encoding='utf-8')
previous = active.read_text(encoding='utf-8')
candidate = 'v2.py'
# La verificación observa salida, código y tiempo límite.
probe = subprocess.run([sys.executable, candidate], capture_output=True,
                       text=True, timeout=5)
healthy = probe.returncode == 0 and 'ENV-42 listo' in probe.stdout
active.write_text(candidate if healthy else previous, encoding='utf-8')
result = subprocess.run([sys.executable, active.read_text(encoding='utf-8')],
                        capture_output=True, text=True, timeout=5, check=True)
assert result.stdout.strip() == 'ENV-42 listo'
print('Candidato rechazado; activa:', active.read_text(encoding='utf-8'))
