# Proyecto integrador Control 1: nivel de un tanque

**Problema:** llevar el nivel de 1,0 a 1,5 m tras un cambio de referencia a los
5 s. El tanque tiene área de 2 m², salida lineal `q_salida = 0,5 h` y bomba
limitada a 1,5 m³/s. Son parámetros de laboratorio, no un diseño de planta real.

**Evidencia final:** `bitacora.md` con modelo, supuestos, polos, respuesta temporal,
error estacionario, estabilidad, márgenes y decisión entre P y PI; conserva los
CSV y una explicación del fallo provocado en cada etapa. Cada tema del curso
indica qué cálculo agregar a la bitácora.

Desde la raíz del repositorio ejecuta:

```bash
python3 examples/control-1-tanque/simular.py --salida /tmp/control-1-tanque
```

Abre `tanque-P.csv` y `tanque-PI.csv` en esa carpeta. Observa el salto de referencia
en `tiempo_s=5`, la altura, el caudal y el error final impreso. La ley P deja un
error persistente; la ley PI lo reduce con la integral. Calcula antes en papel
el equilibrio P: `(0,5 + 0,8*1,5)/(0,5 + 0,8) = 1,3077 m`.

**Fallo deliberado:** cambia `SALIDA` a `0.9` y ejecuta otra vez. El equilibrio P
y el caudal nominal cambian; identifica por qué el sesgo de 0,5 m³/s ya no mantiene
1 m al inicio. Restaura `SALIDA` antes de conservar la evidencia base. La
integración numérica usa Euler con paso 0,02 s; compara con pasos menores si
necesitas estimar el error de discretización. El caso lineal no representa la
salida no lineal de Torricelli ni ruido o retardo del sensor.
