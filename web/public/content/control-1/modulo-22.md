# Módulo 22: Simulacro y formulario

Un parcial nuevo con el estilo de los anteriores y el formulario completo para el examen.

## Aprende construyendo


### Tema 1: Simulacro con solución · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, exp, pi

s = symbols("s")
controlador = 20 * (s + 1) / s
print("PI_correcto:", simplify(controlador - (20 + 20/s)) == 0)
sobrepico = 100 * exp(-pi / 7)
print("sobrepico_porcentaje:", round(float(sobrepico), 1))
```

```bash
python3 verificacion.py
```

</details>
