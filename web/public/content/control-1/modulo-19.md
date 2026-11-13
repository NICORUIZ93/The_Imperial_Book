# Módulo 19: Compensadores de adelanto y atraso

Cuando subir la ganancia no basta (capítulo 15, Ejemplo 4), se agrega un compensador: un cero y un polo bien puestos que cambian la forma del lugar de las raíces.

**Al terminar podrás:**

- Distinguir adelanto (mejora el transitorio) y atraso (mejora el error).
- Diseñar un adelanto con la condición de ángulo.
- Diseñar un atraso para multiplicar \(K_v\) sin mover los polos.
- Implementarlos con op-amps.

## Aprende construyendo

\[G_c(s) = K_c\,\frac{s+z}{s+p}\qquad \text{adelanto: } z<p \qquad \text{atraso: } z>p\]

- Adelanto (lead)El cero está más cerca del origen que el polo. Aporta ángulo positivo: \(\angle(s+z) - \angle(s+p) > 0\). Jala el lugar a la izquierda: más rápido y más amortiguado. Se parece a un PD.
- Atraso (lag)El polo está más cerca del origen. Con \(z\) y \(p\) muy pequeños casi no cambia el lugar, pero multiplica la ganancia en \(s=0\) por \(z/p\). Mejora el error. Se parece a un PI.

### Tema 1: Diseño de un adelanto

**¿Por qué es importante?** El adelanto mejora la velocidad y el amortiguamiento cuando subir la ganancia ya no alcanza.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus) y [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

**Procedimiento**

1. Con \(M_p\) y \(t_s\) deseados, calcula los polos deseados \(s_d\) (capítulo 13 y capítulo 17).
2. Calcula \(\angle G(s_d)\). Lo que falta para llegar a −180° es el ángulo que debe aportar el compensador, \(\phi\).
3. Ubica el cero (una opción simple: cancelar un polo de la planta que no esté en el origen) y calcula el polo para que el compensador aporte \(\phi\).
4. Calcula \(K_c\) con la condición de magnitud.
5. Verifica: simula y revisa que no haya otros polos que dominen.

#### Ejemplo 1 · Adelanto: el doble de rápido · *Experto*

**Enunciado.** Planta \(\dfrac{4}{s(s+2)}\) (en lazo cerrado da \(\zeta = 0{,}5\), \(\omega_n = 2\)). Se quiere \(\zeta = 0{,}5\) con \(\omega_n = 4\).

1. Polos deseados: \(\sigma = 0{,}5\cdot4 = 2\), \(\omega_d = 4\sqrt{0{,}75} = 3{,}46\). \(s_d = -2+3{,}46j\).

   **¿Por qué?** Capítulo 13.

2. Ángulo de la planta en \(s_d\): desde 0 el vector \((-2;\ 3{,}46)\) mide 120°; desde −2, \((0;\ 3{,}46)\) mide 90°. \(\angle G = -(120°+90°) = -210°\).

   **¿Por qué?** Los polos restan su ángulo (17.1).

3. Falta \(+30°\) para llegar a −180°.

   **¿Por qué?** Condición de ángulo: si \(s_d\) estuviera en el lugar, la suma daría −180°.

4. Cero en −2 (cancela el polo de la planta). Queda \(\dfrac{4K_c}{s(s+p)}\): \(-120° - \angle(s_d+p) = -180°\), así que \(\angle(s_d+p) = 60°\).

   **¿Por qué?** Con el cero cancelando, solo falta ubicar el polo.

5. \(\tan60° = \dfrac{3{,}46}{p-2} \Rightarrow p - 2 = 2 \Rightarrow p = 4\).

   **¿Por qué?** Geometría del vector desde \(-p\) hasta \(s_d\).

6. Lazo cerrado: \(s^2 + 4s + 4K_c\). Para \(\omega_n^2 = 16\): \(K_c = 4\).

   **¿Por qué?** Condición de magnitud, o comparar coeficientes.

**Resultado:** \(G_c = 4\dfrac{s+2}{s+4}\): \(t_s\) pasa de 4 s a 2 s

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Adelanto que aporta 30° de fase · *Básico*

**Enunciado.** Halla la relación \(\alpha\) de un compensador \(\dfrac{s + 1/T}{s + 1/(\alpha T)}\) para aportar 30°.

1. \(\alpha = \dfrac{1 - \sin\phi_m}{1 + \sin\phi_m} = \dfrac{1 - 0{,}5}{1 + 0{,}5} \approx 0{,}333\).

   **¿Por qué?** Fórmula de la fase máxima de un adelanto.

**Resultado.** El polo queda 3 veces más lejos que el cero. La fase máxima ocurre en \(\omega_m = 1/(T\sqrt{\alpha})\).

#### Ejemplo 3 · Adelanto que aporta 45° de fase · *Intermedio*

**Enunciado.** Halla la relación \(\alpha\) de un compensador \(\dfrac{s + 1/T}{s + 1/(\alpha T)}\) para aportar 45°.

1. \(\alpha = \dfrac{1 - \sin\phi_m}{1 + \sin\phi_m} = \dfrac{1 - 0{,}707}{1 + 0{,}707} \approx 0{,}172\).

   **¿Por qué?** Fórmula de la fase máxima de un adelanto.

**Resultado.** El polo queda 5,83 veces más lejos que el cero. La fase máxima ocurre en \(\omega_m = 1/(T\sqrt{\alpha})\).

#### Ejemplo 4 · Adelanto que aporta 55° de fase · *Intermedio*

**Enunciado.** Halla la relación \(\alpha\) de un compensador \(\dfrac{s + 1/T}{s + 1/(\alpha T)}\) para aportar 55°.

1. \(\alpha = \dfrac{1 - \sin\phi_m}{1 + \sin\phi_m} = \dfrac{1 - 0{,}819}{1 + 0{,}819} \approx 0{,}099\).

   **¿Por qué?** Fórmula de la fase máxima de un adelanto.

**Resultado.** El polo queda 10,06 veces más lejos que el cero. La fase máxima ocurre en \(\omega_m = 1/(T\sqrt{\alpha})\).

#### Ejemplo 5 · Adelanto que aporta 20° de fase · *Básico*

**Enunciado.** Halla la relación \(\alpha\) de un compensador \(\dfrac{s + 1/T}{s + 1/(\alpha T)}\) para aportar 20°.

1. \(\alpha = \dfrac{1 - \sin\phi_m}{1 + \sin\phi_m} = \dfrac{1 - 0{,}342}{1 + 0{,}342} \approx 0{,}49\).

   **¿Por qué?** Fórmula de la fase máxima de un adelanto.

**Resultado.** El polo queda 2,04 veces más lejos que el cero. La fase máxima ocurre en \(\omega_m = 1/(T\sqrt{\alpha})\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2.

```python
# verificacion.py
from sympy import sin, pi, N

phi = pi / 6  # 30 grados
alpha = N((1 - sin(phi)) / (1 + sin(phi)), 3)
print("alpha:", alpha)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `alpha: 0.333`, igual al Ejemplo 2 (el polo queda 3 veces más lejos que el cero).

#### Practica

cambia `phi` a `pi*45/180` y confirma \(\alpha\approx0{,}172\) (Ejemplo 3, 45° de fase). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** esta fórmula de \(\alpha\) da la relación cero/polo para la fase **máxima** de un adelanto simple; no dice dónde ubicar ese cero en \(s\) — eso sale de la condición de ángulo en el polo deseado \(s_d\) (procedimiento completo del Ejemplo 1).

### Tema 2: Diseño de un atraso

**¿Por qué es importante?** El atraso reduce el error final sin dañar el transitorio, algo que la ganancia sola no puede lograr.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus) y [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

#### Demostración · el atraso multiplica el error sin mover los polos

1. En \(s = 0\): \(G_c(0) = K_c\dfrac{z}{p}\). Si \(K_c = 1\) y \(z/p = 10\), \(K_v\) se multiplica por 10.
2. Cerca de los polos dominantes \(s_d\) (lejos del origen), \(\dfrac{s_d+z}{s_d+p} \approx 1\) en magnitud y casi 0° en ángulo, porque \(z\) y \(p\) son muy pequeños comparados con \(|s_d|\).
3. Así que el lugar de las raíces, y por lo tanto el transitorio, casi no cambia.

∎

#### Ejemplo 1 · Atraso: diez veces menos error · *Experto*

> **Qué cambia respecto al anterior:** Ahora se busca menos error, no más velocidad.

**Enunciado.** Misma planta (\(K_v = 2\)). Se quiere \(K_v = 20\) sin cambiar el transitorio.

1. Necesitas multiplicar \(K_v\) por 10, así que \(z/p = 10\).

   **¿Por qué?** El atraso multiplica la ganancia en \(s = 0\) por \(z/p\) (demostración arriba).

2. Elige \(z\) y \(p\) pequeños: \(z = 0{,}1\), \(p = 0{,}01\).

   **¿Por qué?** Cerca del origen casi no tocan el lugar donde están los polos dominantes.

3. Comprueba el ángulo en \(s_d = -1+1{,}73j\): \(117{,}5° - 119{,}8° = -2{,}3°\).

   **¿Por qué?** Menos de 5° se considera despreciable.

**Resultado:** \(G_c = \dfrac{s+0{,}1}{s+0{,}01}\): \(K_v = 20\), error ante rampa 0,05

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Atraso para subir Kv de 2 a 20 · *Básico*

**Enunciado.** Diseña el cero y el polo del atraso sin mover los polos dominantes.

1. \(\beta = K_{v,\text{nuevo}}/K_{v,\text{actual}} = 10\).

   **¿Por qué?** El atraso multiplica la ganancia en bajas frecuencias por \(\beta\) (relación cero/polo).

2. Elige el cero cerca del origen, por ejemplo \(z = 0{,}1\), y el polo en \(p = z/\beta = 0{,}01\).

   **¿Por qué?** El par cero-polo muy pegado al origen casi no cambia el ángulo en los polos dominantes.

**Resultado.** \(C(s) = \dfrac{s + 0{,}1}{s + 0{,}01}\): el error ante rampa baja 10 veces y la respuesta transitoria casi no cambia.

#### Ejemplo 3 · Atraso para subir Kv de 5 a 50 · *Intermedio*

**Enunciado.** Diseña el cero y el polo del atraso sin mover los polos dominantes.

1. \(\beta = K_{v,\text{nuevo}}/K_{v,\text{actual}} = 10\).

   **¿Por qué?** El atraso multiplica la ganancia en bajas frecuencias por \(\beta\) (relación cero/polo).

2. Elige el cero cerca del origen, por ejemplo \(z = 0{,}1\), y el polo en \(p = z/\beta = 0{,}01\).

   **¿Por qué?** El par cero-polo muy pegado al origen casi no cambia el ángulo en los polos dominantes.

**Resultado.** \(C(s) = \dfrac{s + 0{,}1}{s + 0{,}01}\): el error ante rampa baja 10 veces y la respuesta transitoria casi no cambia.

#### Ejemplo 4 · Atraso para subir Kv de 1 a 8 · *Intermedio*

**Enunciado.** Diseña el cero y el polo del atraso sin mover los polos dominantes.

1. \(\beta = K_{v,\text{nuevo}}/K_{v,\text{actual}} = 8\).

   **¿Por qué?** El atraso multiplica la ganancia en bajas frecuencias por \(\beta\) (relación cero/polo).

2. Elige el cero cerca del origen, por ejemplo \(z = 0{,}1\), y el polo en \(p = z/\beta = 0{,}013\).

   **¿Por qué?** El par cero-polo muy pegado al origen casi no cambia el ángulo en los polos dominantes.

**Resultado.** \(C(s) = \dfrac{s + 0{,}1}{s + 0{,}013}\): el error ante rampa baja 8 veces y la respuesta transitoria casi no cambia.

#### Ejemplo 5 · Atraso para subir Kv de 10 a 40 · *Básico*

**Enunciado.** Diseña el cero y el polo del atraso sin mover los polos dominantes.

1. \(\beta = K_{v,\text{nuevo}}/K_{v,\text{actual}} = 4\).

   **¿Por qué?** El atraso multiplica la ganancia en bajas frecuencias por \(\beta\) (relación cero/polo).

2. Elige el cero cerca del origen, por ejemplo \(z = 0{,}1\), y el polo en \(p = z/\beta = 0{,}025\).

   **¿Por qué?** El par cero-polo muy pegado al origen casi no cambia el ángulo en los polos dominantes.

**Resultado.** \(C(s) = \dfrac{s + 0{,}1}{s + 0{,}025}\): el error ante rampa baja 4 veces y la respuesta transitoria casi no cambia.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2.

```python
# verificacion.py
z, p = 0.1, 0.01
print("beta:", z / p)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `beta: 10.0`, igual al Ejemplo 2 (\(K_v\) se multiplica por 10).

#### Practica

cambia `z, p` a `0.1, 0.0125` y confirma `beta: 8.0` (Ejemplo 4). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** esta multiplicación de \(K_v\) solo es válida si el cero y el polo quedan mucho más cerca del origen que los polos dominantes (regla práctica: a menos de 5° de desviación, como se comprueba en el Ejemplo 1); si \(z\) o \(p\) se acercan demasiado a \(s_d\), sí mueven el transitorio.

### Tema 3: Implementación con op-amps

**¿Por qué es importante?** Implementar el compensador con op-amps conecta el diseño en papel con un circuito real.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus) y [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

Dos inversores en cascada: el primero con \(Z_i = R_1\parallel C_1\) y \(Z_f = R_2\parallel C_2\); el segundo con \(R_3\) y \(R_4\) para corregir el signo y la ganancia.

\[G_c(s) = \frac{R_4R_2}{R_3R_1}\cdot\frac{R_1C_1s+1}{R_2C_2s+1} = \frac{R_4C_1}{R_3C_2}\cdot\frac{s+\frac{1}{R_1C_1}}{s+\frac{1}{R_2C_2}}\]

*Adelanto si \(R_1C_1 > R_2C_2\); atraso si \(R_1C_1 < R_2C_2\).*

#### Demostración

Con capítulo 8: \(Z_i = \dfrac{R_1}{1+sR_1C_1}\), \(Z_f = \dfrac{R_2}{1+sR_2C_2}\). La primera etapa da \(-\dfrac{R_2}{R_1}\cdot\dfrac{1+sR_1C_1}{1+sR_2C_2}\), y la segunda \(-R_4/R_3\). El producto quita el signo. Para la segunda forma, saca \(R_1C_1\) y \(R_2C_2\) como factor común.

∎

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Compensador con op-amps: R1 = 100 kΩ, C1 = 1 µF, R2 = 10 kΩ, C2 = 1 µF · *Intermedio*

**Enunciado.** Con la red \(R_1\parallel C_1\) a la entrada y \(R_2\parallel C_2\) en realimentación (más un inversor), halla cero, polo y tipo.

1. \(\dfrac{V_o}{V_i} = \dfrac{R_2}{R_1}\dfrac{R_1C_1s + 1}{R_2C_2s + 1} = \dfrac{C_1}{C_2}\dfrac{s + 1/(R_1C_1)}{s + 1/(R_2C_2)}\).

   **¿Por qué?** Inversor con impedancias en paralelo y un segundo inversor para quitar el signo.

2. Cero en \(-10\), polo en \(-100\).

   **¿Por qué?** Cero más cerca del origen que el polo → adelanto; al revés → atraso.

**Resultado.** Es un **adelanto** con ganancia de alta frecuencia \(1\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
R1, C1, R2, C2 = 100e3, 1e-6, 10e3, 1e-6
cero = -1 / (R1 * C1)
polo = -1 / (R2 * C2)
print("cero:", cero)
print("polo:", polo)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `cero: -10.0` y `polo: -100.0`, igual al Ejemplo 1 (cero más cerca del origen que el polo: es un adelanto).

#### Practica

cambia los valores a los del Ejemplo 3 (\(R_1=1\text{k}\Omega, C_1=1\mu F, R_2=10\text{k}\Omega, C_2=1\mu F\)) y confirma que ahora el polo (\(-100\)) queda más cerca del origen que el cero (\(-1000\)): es un atraso. Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** este script solo ubica el cero y el polo; la ganancia de alta frecuencia (\(C_1/C_2\)) y el signo (dos inversores en cascada) hay que calcularlos aparte, como en la demostración de este tema.

#### Ejemplo 2 · Compensador con op-amps: R1 = 10 kΩ, C1 = 10 µF, R2 = 1 kΩ, C2 = 10 µF · *Intermedio*

**Enunciado.** Con la red \(R_1\parallel C_1\) a la entrada y \(R_2\parallel C_2\) en realimentación (más un inversor), halla cero, polo y tipo.

1. \(\dfrac{V_o}{V_i} = \dfrac{R_2}{R_1}\dfrac{R_1C_1s + 1}{R_2C_2s + 1} = \dfrac{C_1}{C_2}\dfrac{s + 1/(R_1C_1)}{s + 1/(R_2C_2)}\).

   **¿Por qué?** Inversor con impedancias en paralelo y un segundo inversor para quitar el signo.

2. Cero en \(-10\), polo en \(-100\).

   **¿Por qué?** Cero más cerca del origen que el polo → adelanto; al revés → atraso.

**Resultado.** Es un **adelanto** con ganancia de alta frecuencia \(1\).

#### Ejemplo 3 · Compensador con op-amps: R1 = 1 kΩ, C1 = 1 µF, R2 = 10 kΩ, C2 = 1 µF · *Intermedio*

**Enunciado.** Con la red \(R_1\parallel C_1\) a la entrada y \(R_2\parallel C_2\) en realimentación (más un inversor), halla cero, polo y tipo.

1. \(\dfrac{V_o}{V_i} = \dfrac{R_2}{R_1}\dfrac{R_1C_1s + 1}{R_2C_2s + 1} = \dfrac{C_1}{C_2}\dfrac{s + 1/(R_1C_1)}{s + 1/(R_2C_2)}\).

   **¿Por qué?** Inversor con impedancias en paralelo y un segundo inversor para quitar el signo.

2. Cero en \(-1000\), polo en \(-100\).

   **¿Por qué?** Cero más cerca del origen que el polo → adelanto; al revés → atraso.

**Resultado.** Es un **atraso** con ganancia de alta frecuencia \(1\).

#### Ejemplo 4 · Compensador con op-amps: R1 = 220 kΩ, C1 = 1 µF, R2 = 22 kΩ, C2 = 0,47 µF · *Avanzado*

**Enunciado.** Con la red \(R_1\parallel C_1\) a la entrada y \(R_2\parallel C_2\) en realimentación (más un inversor), halla cero, polo y tipo.

1. \(\dfrac{V_o}{V_i} = \dfrac{R_2}{R_1}\dfrac{R_1C_1s + 1}{R_2C_2s + 1} = \dfrac{C_1}{C_2}\dfrac{s + 1/(R_1C_1)}{s + 1/(R_2C_2)}\).

   **¿Por qué?** Inversor con impedancias en paralelo y un segundo inversor para quitar el signo.

2. Cero en \(-4{,}545\), polo en \(-96{,}712\).

   **¿Por qué?** Cero más cerca del origen que el polo → adelanto; al revés → atraso.

**Resultado.** Es un **adelanto** con ganancia de alta frecuencia \(2{,}128\).

#### Ejemplo 5 · Compensador con op-amps: R1 = 47 kΩ, C1 = 2,2 µF, R2 = 4,7 kΩ, C2 = 2,2 µF · *Intermedio*

**Enunciado.** Con la red \(R_1\parallel C_1\) a la entrada y \(R_2\parallel C_2\) en realimentación (más un inversor), halla cero, polo y tipo.

1. \(\dfrac{V_o}{V_i} = \dfrac{R_2}{R_1}\dfrac{R_1C_1s + 1}{R_2C_2s + 1} = \dfrac{C_1}{C_2}\dfrac{s + 1/(R_1C_1)}{s + 1/(R_2C_2)}\).

   **¿Por qué?** Inversor con impedancias en paralelo y un segundo inversor para quitar el signo.

2. Cero en \(-9{,}671\), polo en \(-96{,}712\).

   **¿Por qué?** Cero más cerca del origen que el polo → adelanto; al revés → atraso.

**Resultado.** Es un **adelanto** con ganancia de alta frecuencia \(1\).

