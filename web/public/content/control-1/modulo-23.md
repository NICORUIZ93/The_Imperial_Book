# Módulo 23: Criterio de Nyquist

El diagrama de Bode (módulo 20) te dio los márgenes. El criterio de Nyquist explica de dónde salen y responde algo que Bode no puede: si el lazo cerrado es estable aunque el lazo abierto sea inestable. Es la unidad 5 del programa de Control I y entra en el examen final.

**Al terminar podrás:**

- Dibujar el diagrama polar de \(L(j\omega)\) y leer en él los márgenes de ganancia y de fase.
- Aplicar \(Z = N + P\) para decidir la estabilidad del lazo cerrado y hallar el rango de \(K\).
- Tratar polos en el origen y lazos abiertos inestables, y saber cuándo los márgenes de Bode engañan.

**Prerrequisitos:** módulos 15 (Routh-Hurwitz) y 20 (Bode y márgenes). **Lee en la bibliografía:** Ogata, cap. 7; Nise, cap. 10; Dorf y Bishop, cap. 9; Golnaraghi y Kuo, cap. 10.

**Laboratorio.** Trabajas en `academia-labs/control-1` con el entorno del módulo 0. Si aún no tienes `python-control`, instálalo con `python3 -m pip install control` (este módulo se verificó con `control 0.10.2`).

## Aprende construyendo

### Tema 1: Del Bode al diagrama polar · Intermedio · 30 min

**¿Por qué es importante?** Bode dibuja magnitud y fase por separado. El diagrama polar las junta en una sola curva del plano complejo, y en ese plano la distancia al punto \(-1\) mide qué tan cerca está el lazo de oscilar. **Modelo mental:** cada frecuencia es un punto; la curva es el recorrido de ese punto cuando \(\omega\) sube de 0 a \(\infty\).

**Proyecto integrador:** el lazo \(L(s) = \dfrac{K}{(s+1)(s+2)(s+3)}\) acompaña todo el módulo. **Límite:** el diagrama polar solo describe el lazo abierto; la estabilidad del lazo cerrado sale del criterio del Tema 2.

#### Subtema 1.1: Calcula los puntos clave de la curva · 10 min

**1. Contexto**

Para dibujar el diagrama polar a mano bastan tres puntos: dónde empieza (\(\omega = 0\)), dónde cruza el eje real negativo y dónde termina (\(\omega \to \infty\)).

**2. Hazlo tú**

Guarda en `academia-labs/control-1/nyquist_puntos.py`:

```python
# nyquist_puntos.py
import numpy as np
import control as ct

L = ct.tf([30], [1, 6, 11, 6])        # 30/((s+1)(s+2)(s+3))
w_cruce = np.sqrt(11)

print("L(j0) =", round(L(0j).real, 3))
print("w_cruce =", round(w_cruce, 3))
print("L(j w_cruce) =", round(L(1j * w_cruce).real, 3))
print("|L(j1000)| =", f"{abs(L(1000j)):.1e}")
```

Ejecuta `python3 nyquist_puntos.py`.

**Resultado esperado:**

```text
L(j0) = 5.0
w_cruce = 3.317
L(j w_cruce) = -0.5
|L(j1000)| = 3.0e-08
```

**Fallo deliberado:** cambia `L(1j * w_cruce)` por `L(w_cruce)`. **Resultado observado:** `L(j w_cruce) = 0.207`, un número positivo. **Diagnóstico:** evaluaste \(L(s)\) en \(s = 3{,}317\) (un punto del eje real), no en \(s = j\,3{,}317\). La respuesta en frecuencia siempre se evalúa sobre el eje imaginario.

**3. Entiende**

Con \(s = j\omega\), el denominador es \((j\omega)^3 + 6(j\omega)^2 + 11j\omega + 6 = (6 - 6\omega^2) + j(11\omega - \omega^3)\).

- En \(\omega = 0\): \(L = 30/6 = 5\), sobre el eje real positivo.
- La curva cruza el eje real cuando la parte imaginaria del denominador se anula: \(11\omega - \omega^3 = 0 \Rightarrow \omega = \sqrt{11}\). Ahí \(L = \dfrac{30}{6 - 66} = -0{,}5\).
- Cuando \(\omega \to \infty\), \(L \approx 30/(j\omega)^3 \to 0\) llegando con fase \(-270^\circ\).

**4. Cierra**

Anota los tres puntos y dibuja a mano la curva: sale de 5, baja por el cuarto cuadrante, cruza el eje real negativo en \(-0{,}5\) y entra al origen.

#### Subtema 1.2: Lee los márgenes en el plano · 10 min

**1. Contexto**

En el módulo 20 calculaste los márgenes en Bode. En el diagrama polar son distancias y ángulos medidos respecto al punto \(-1\).

**2. Hazlo tú**

Añade al final de `nyquist_puntos.py`:

```python
gm, pm, w_pc, w_gc = ct.margin(L)
print("MG =", round(gm, 2), "veces =", round(20 * np.log10(gm), 2), "dB")
print("MF =", round(pm, 1), "grados en w =", round(w_gc, 2))
```

**Resultado esperado:** `MG = 2.0 veces = 6.02 dB` y `MF = 25.4 grados en w = 2.35`.

**Fallo deliberado:** imprime `20 * np.log10(pm)`. **Diagnóstico:** el margen de fase está en grados y nunca se pasa a dB; solo el de ganancia es un cociente de magnitudes.

**3. Entiende**

- **Margen de ganancia:** la curva cruza el eje real negativo en \(-0{,}5\). Hay que multiplicar la ganancia por \(1/0{,}5 = 2\) para que pase por \(-1\): \(MG = 2\) (6,02 dB).
- **Margen de fase:** donde \(|L(j\omega)| = 1\) (la curva corta el círculo unitario), el ángulo que le falta para llegar a \(-180^\circ\) es el margen de fase: \(25{,}4^\circ\).

\[MG = \frac{1}{|L(j\omega_{pc})|}, \qquad MF = 180^\circ + \angle L(j\omega_{gc})\]

**4. Cierra**

Marca en tu dibujo el cruce \(-0{,}5\), el círculo unitario y el ángulo de \(25{,}4^\circ\). Ya puedes leer en una sola figura lo que en Bode necesitaba dos.

#### Subtema 1.3: Completa la curva con las frecuencias negativas · 10 min

**1. Contexto**

El criterio de Nyquist usa la curva completa, también para \(\omega < 0\). No hay que calcular nada nuevo: es el reflejo de la que ya tienes.

**2. Hazlo tú**

Guarda en `nyquist_figura.py` y ejecútalo:

```python
# nyquist_figura.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import control as ct

L = ct.tf([30], [1, 6, 11, 6])
ct.nyquist_plot(L)
plt.savefig("nyquist_k30.png")
print("L(+j2) =", complex(round(L(2j).real, 3), round(L(2j).imag, 3)))
print("L(-j2) =", complex(round(L(-2j).real, 3), round(L(-2j).imag, 3)))
```

**Resultado esperado:** se crea `nyquist_k30.png` y se imprime `L(+j2) = (-1.038-0.808j)` y `L(-j2) = (-1.038+0.808j)`: mismas partes reales, partes imaginarias opuestas.

**Fallo deliberado:** quita `matplotlib.use("Agg")` en un servidor sin pantalla. **Diagnóstico:** si aparece un error de backend gráfico, vuelve a ponerlo: `Agg` dibuja directamente en archivo.

**3. Entiende**

Como \(L(s)\) tiene coeficientes reales, \(L(-j\omega) = \overline{L(j\omega)}\): la rama de \(\omega < 0\) es el espejo de la rama de \(\omega > 0\) respecto al eje real. `nyquist_plot` dibuja las dos ramas (la reflejada con línea discontinua).

![Diagrama de Nyquist de K/((s+1)(s+2)(s+3)) para K = 30 y K = 90](content/figures/control-1/nyquist-tercer-orden.svg)

*Con \(K = 30\) la curva cruza en \(-0{,}5\) y deja el punto \(-1\) fuera. Con \(K = 90\) cruza en \(-1{,}5\) y lo rodea dos veces.*

**4. Cierra**

Abre `nyquist_k30.png` y comprueba que la curva es simétrica y que el punto \(-1\) queda fuera.

#### Ejercicios del tema

1. Halla dónde cruza el eje real negativo \(L(s) = \dfrac{12}{(s+1)(s+2)(s+3)}\) y su margen de ganancia.

   <details><summary>Solución</summary>

   El cruce sigue en \(\omega = \sqrt{11}\) porque el denominador no cambió. \(L = 12/(-60) = -0{,}2\). \(MG = 1/0{,}2 = 5\) (13,98 dB).

   </details>

2. Para \(L(s) = \dfrac{10}{s+10}\), ¿la curva cruza el eje real negativo?

   <details><summary>Solución</summary>

   No. La fase va de \(0^\circ\) a \(-90^\circ\) y nunca llega a \(-180^\circ\): la curva es un semicírculo en el cuarto cuadrante, de 1 al origen. El margen de ganancia es infinito.

   </details>

**Hito del tema:**

- [ ] Calculé a mano y con Python los tres puntos clave de la curva.
- [ ] Provoqué y diagnostiqué el error de evaluar en \(s = \omega\) en vez de \(s = j\omega\).
- [ ] Leí \(MG = 2\) y \(MF = 25{,}4^\circ\) en el diagrama polar.
- [ ] Expliqué por qué la rama de frecuencias negativas es un espejo.

**Fuentes oficiales:** [nyquist_response, python-control](https://python-control.readthedocs.io/en/latest/generated/control.nyquist_response.html) y [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

### Tema 2: El criterio Z = N + P · Intermedio · 35 min

**¿Por qué es importante?** Routh te dice si el lazo cerrado es estable; Nyquist te lo dice mirando solo el lazo abierto, que es lo que se mide en un laboratorio. **Modelo mental:** cuentas cuántas vueltas da la curva alrededor de \(-1\); cada vuelta de más es un polo inestable del lazo cerrado.

**Proyecto integrador:** decide la estabilidad del lazo del Tema 1 para \(K = 30\) y \(K = 90\) y halla el \(K\) límite sin Routh. **Límite:** el criterio cuenta polos inestables; no dice qué tan rápida ni qué tan amortiguada es la respuesta.

#### Subtema 2.1: Cuenta las vueltas · 10 min

**1. Contexto**

Los polos del lazo cerrado son los ceros de \(1 + L(s)\). Si el contorno de Nyquist (todo el eje imaginario más un semicírculo de radio infinito que encierra el semiplano derecho) contiene \(Z\) ceros y \(P\) polos de \(1 + L\), la curva \(1 + L\) da \(Z - P\) vueltas en sentido horario alrededor del origen. Rodear el origen con \(1 + L\) es lo mismo que rodear \(-1\) con \(L\).

**2. Hazlo tú**

Guarda en `nyquist_criterio.py`:

```python
# nyquist_criterio.py
import numpy as np
import control as ct

for K in (30, 90):
    L = ct.tf([K], [1, 6, 11, 6])
    N = ct.nyquist_response(L).count      # vueltas horarias alrededor de -1
    P = int(np.sum(L.poles().real > 0))   # polos de L en el semiplano derecho
    Z = N + P
    inestables = int(np.sum(ct.feedback(L, 1).poles().real > 0))
    print(f"K={K}: N={N}, P={P}, Z={Z}, polos inestables del lazo cerrado={inestables}")
```

**Resultado esperado:**

```text
K=30: N=0, P=0, Z=0, polos inestables del lazo cerrado=0
K=90: N=2, P=0, Z=2, polos inestables del lazo cerrado=2
```

**Fallo deliberado:** cambia `Z = N + P` por `Z = N - P`. Con estos lazos no cambia nada porque \(P = 0\); el error aparece en el Subtema 2.3. **Diagnóstico:** escribe la fórmula junto a su significado: \(N\) son vueltas horarias, \(P\) polos inestables del lazo abierto y \(Z\) polos inestables del lazo cerrado.

**3. Entiende**

\[\boxed{Z = N + P}\]

- \(P\): polos de \(L(s)\) en el semiplano derecho (se leen de la función de transferencia).
- \(N\): vueltas netas de \(L(j\omega)\) alrededor de \(-1\), positivas en sentido horario.
- \(Z\): polos del lazo cerrado en el semiplano derecho. **El lazo cerrado es estable si y solo si \(Z = 0\).**

Con \(K = 90\) la curva cruza en \(-1{,}5\) y rodea \(-1\) dos veces (ida por \(\omega > 0\), vuelta por \(\omega < 0\)): dos polos inestables, que son \(0{,}278 \pm 3{,}817j\).

**4. Cierra**

Registra la tabla de \(N\), \(P\) y \(Z\) para los dos valores de \(K\) y comprueba que coincide con los polos calculados.

#### Subtema 2.2: Halla el K límite sin Routh · 10 min

**1. Contexto**

En el módulo 15 hallaste rangos de \(K\) con el arreglo de Routh. Con Nyquist basta saber dónde cruza la curva el eje real negativo.

**2. Hazlo tú**

Añade a `nyquist_criterio.py`:

```python
L1 = ct.tf([1], [1, 6, 11, 6])           # el lazo con K = 1
cruce = L1(1j * np.sqrt(11)).real
print("cruce con K=1:", round(cruce, 4))
print("K limite:", round(-1 / cruce, 1))
print("polos con K=60:", np.round(ct.feedback(60 * L1, 1).poles(), 3))
```

**Resultado esperado:** `cruce con K=1: -0.0167`, `K limite: 60.0` y polos `[-6.+0.j     0.+3.317j  0.-3.317j]`.

**Fallo deliberado:** usa `K = 60` en el bucle del Subtema 2.1. **Resultado observado:** `N=0`, pero el lazo cerrado tiene dos polos sobre el eje imaginario. **Diagnóstico:** la curva pasa exactamente por \(-1\); el conteo de vueltas no está definido y el lazo es marginalmente estable (oscila a \(\sqrt{11}\) rad/s).

**3. Entiende**

Con ganancia \(K\), el cruce está en \(-K/60\). El punto \(-1\) queda fuera mientras \(K/60 < 1\):

\[0 < K < 60\]

Es el mismo resultado que da Routh con \(s^3 + 6s^2 + 11s + 6 + K\): la fila \(s^1\) vale \((66 - 6 - K)/6\), que se anula en \(K = 60\), y la fila auxiliar \(6s^2 + 66 = 0\) da \(\omega = \sqrt{11}\).

**4. Cierra**

Escribe en una línea por qué el cruce del eje real negativo y la fila de ceros de Routh dan la misma frecuencia.

#### Subtema 2.3: Lazo abierto inestable · 15 min

**1. Contexto**

Un péndulo invertido o un levitador magnético son inestables en lazo abierto (\(P > 0\)). La realimentación puede estabilizarlos, y Nyquist lo detecta con vueltas en sentido **antihorario**.

**2. Hazlo tú**

Guarda en `nyquist_inestable.py`:

```python
# nyquist_inestable.py
import numpy as np
import control as ct

for K in (0.5, 2):
    L = ct.tf([K], [1, -1])              # K/(s - 1)
    N = ct.nyquist_response(L).count
    P = int(np.sum(L.poles().real > 0))
    polo = ct.feedback(L, 1).poles()[0].real
    print(f"K={K}: N={N}, P={P}, Z={N + P}, polo del lazo cerrado={polo}")
```

**Resultado esperado:**

```text
K=0.5: N=0, P=1, Z=1, polo del lazo cerrado=0.5
K=2: N=-1, P=1, Z=0, polo del lazo cerrado=-1.0
```

**Fallo deliberado:** ahora sí cambia `N + P` por `N - P`. **Resultado observado:** `K=0.5` daría \(Z = -1\), un número de polos negativo, imposible. **Diagnóstico:** la fórmula es \(Z = N + P\); cuando el lazo abierto es inestable hacen falta \(P\) vueltas antihorarias (\(N = -P\)) para que \(Z = 0\).

**3. Entiende**

\(L(j\omega) = \dfrac{K}{j\omega - 1}\) es un círculo de centro \(-K/2\) y radio \(K/2\): va de \(-K\) (en \(\omega = 0\)) al origen. Si \(K > 1\), el círculo encierra \(-1\) en sentido antihorario (\(N = -1\)) y \(Z = -1 + 1 = 0\). Comprobación directa: el lazo cerrado es \(s - 1 + K\), estable si \(K > 1\).

**4. Cierra**

Escribe la regla para tu formulario: **con \(P\) polos inestables en lazo abierto, el lazo cerrado es estable solo si la curva rodea \(-1\) exactamente \(P\) veces en sentido antihorario.**

#### Ejercicios del tema

1. \(L(s) = \dfrac{K}{(s+2)^3}\). Halla el rango de \(K > 0\) para que el lazo cerrado sea estable.

   <details><summary>Solución</summary>

   \((j\omega+2)^3 = (8 - 6\omega^2) + j(12\omega - \omega^3)\). La parte imaginaria se anula en \(\omega = \sqrt{12}\), donde la real vale \(8 - 72 = -64\). El cruce está en \(-K/64\): estable si \(0 < K < 64\). Comprobación: Routh de \(s^3 + 6s^2 + 12s + 8 + K\) da \(72 > 8 + K\).

   </details>

2. Un lazo tiene \(P = 2\) y su curva rodea \(-1\) dos veces en sentido horario. ¿Cuántos polos inestables tiene el lazo cerrado?

   <details><summary>Solución</summary>

   \(N = +2\), \(Z = 2 + 2 = 4\). Para estabilizarlo harían falta dos vueltas antihorarias (\(N = -2\)).

   </details>

**Hito del tema:**

- [ ] Conté \(N\), \(P\) y \(Z\) con python-control y los comparé con los polos del lazo cerrado.
- [ ] Hallé \(0 < K < 60\) desde el cruce del eje real y lo contrasté con Routh.
- [ ] Provoqué el error \(Z = N - P\) con un lazo abierto inestable y lo diagnostiqué.
- [ ] Expliqué por qué un lazo abierto inestable necesita vueltas antihorarias.

**Fuentes oficiales:** [nyquist_response, python-control](https://python-control.readthedocs.io/en/latest/generated/control.nyquist_response.html) y [Estabilidad en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

### Tema 3: Polos en el origen y estabilidad relativa · Avanzado · 30 min

**¿Por qué es importante?** Casi todos los lazos con acción integral tienen un polo en \(s = 0\), justo sobre el contorno de Nyquist. Además, los márgenes de Bode solo valen bajo ciertas condiciones que conviene conocer. **Modelo mental:** el contorno esquiva el polo del origen con un semicírculo diminuto, y ese rodeo se convierte en un arco gigante en el diagrama.

**Proyecto integrador:** analiza \(L(s) = \dfrac{K}{s(s+1)(s+2)}\), el lazo del módulo 17. **Límite:** este tema trata polos simples en el origen; con dos integradores el arco es de \(360^\circ\).

#### Subtema 3.1: Rodea el polo del origen · 10 min

**1. Contexto**

\(L(j\omega)\) no está definido en \(\omega = 0\) si hay un integrador. El contorno lo esquiva por la derecha con un semicírculo de radio \(\varepsilon \to 0\); como el polo queda fuera del contorno, no cuenta en \(P\).

**2. Hazlo tú**

Guarda en `nyquist_integrador.py`:

```python
# nyquist_integrador.py
import numpy as np
import control as ct

L1 = ct.tf([1], [1, 3, 2, 0])            # 1/(s(s+1)(s+2))
print("cruce con K=1:", round(L1(1j * np.sqrt(2)).real, 4))
print("asintota real:", round(L1(1e-4j).real, 3))
for K in (3, 9):
    L = K * L1
    N = ct.nyquist_response(L).count
    print(f"K={K}: N={N}, polos LC={np.round(ct.feedback(L, 1).poles(), 3)}")
```

**Resultado esperado:**

```text
cruce con K=1: -0.1667
asintota real: -0.75
K=3: N=0, polos LC=[-2.672+0.j    -0.164+1.047j -0.164-1.047j]
K=9: N=2, polos LC=[-3.24+0.j     0.12+1.662j  0.12-1.662j]
```

**Fallo deliberado:** cuenta el polo del origen dentro de \(P\) (\(P = 1\)). **Diagnóstico:** con \(K = 3\) obtendrías \(Z = 1\) y declararías inestable un lazo cuyos polos están todos a la izquierda. El polo del origen queda fuera del contorno indentado: \(P = 0\).

**3. Entiende**

- Cerca de \(\omega = 0^+\), \(L \approx \dfrac{K}{2j\omega}\): la curva viene desde \(-j\infty\), con parte real que tiende a \(-0{,}75K\) (asíntota vertical).
- El semicírculo pequeño alrededor del origen se transforma en un arco de radio infinito que gira \(180^\circ\) en sentido horario y une la rama \(\omega = 0^-\) con la rama \(\omega = 0^+\) por la derecha. Ese arco no rodea \(-1\).
- El cruce del eje real negativo está en \(\omega = \sqrt2\) y vale \(-K/6\): estable si \(0 < K < 6\), igual que en el módulo 17.

**4. Cierra**

Dibuja la curva completa con el arco de radio infinito y marca el cruce \(-K/6\).

#### Subtema 3.2: Mide la estabilidad relativa · 10 min

**1. Contexto**

Saber que el lazo es estable no basta: el margen dice cuánto puede cambiar la planta antes de oscilar.

**2. Hazlo tú**

Añade a `nyquist_integrador.py`:

```python
L = 3 * L1
gm, pm, w_pc, w_gc = ct.margin(L)
w = np.logspace(-2, 2, 20000)
distancia = np.min(np.abs(1 + L(1j * w)))
print("MG =", round(gm, 2), "MF =", round(pm, 1), "distancia minima a -1 =", round(distancia, 3))
```

**Resultado esperado:** `MG = 2.0 MF = 20.0 distancia minima a -1 = 0.285`.

**Fallo deliberado:** usa `np.logspace(0, 2, ...)` (desde \(\omega = 1\)). **Diagnóstico:** el punto más cercano a \(-1\) está alrededor de \(\omega \approx 1\); si el barrido empieza tarde o es grueso, sobrestimas la distancia. Barre al menos dos décadas a cada lado del cruce.

**3. Entiende**

- \(MG = 2\): la ganancia puede duplicarse (de 3 a 6) antes de la inestabilidad.
- \(MF = 20^\circ\): un retardo que agregue \(20^\circ\) de atraso en \(\omega = 0{,}97\) rad/s lo desestabiliza.
- La **distancia mínima** de la curva a \(-1\) es \(1/M_s\), donde \(M_s\) es el pico de la sensibilidad \(S = 1/(1+L)\) (módulo 24). Aquí \(M_s = 1/0{,}285 \approx 3{,}5\), un lazo poco robusto: \(MF = 20^\circ\) da un sobrepico alto.

**4. Cierra**

Anota los tres números y explica cuál de ellos es la medida más completa de robustez.

#### Subtema 3.3: Cuándo los márgenes de Bode engañan · 10 min

**1. Contexto**

La regla «estable si \(MG > 1\) y \(MF > 0\)» supone un lazo abierto estable y con un solo cruce. Con \(P > 0\) falla.

**2. Hazlo tú**

Guarda en `margenes_engano.py`:

```python
# margenes_engano.py
import control as ct

L = ct.tf([2], [1, -1])                  # 2/(s - 1), estable en lazo cerrado
gm, pm, w_pc, w_gc = ct.margin(L)
print("MG =", round(gm, 2), "MF =", round(pm, 1))
print("polo del lazo cerrado:", ct.feedback(L, 1).poles()[0].real)
print("N =", ct.nyquist_response(L).count)
```

**Resultado esperado:** `MG = 0.5 MF = 60.0`, `polo del lazo cerrado: -1.0` y `N = -1`.

**Fallo deliberado:** concluye «\(MG < 1\), entonces inestable». **Diagnóstico:** el polo del lazo cerrado está en \(-1\); el lazo es estable. Aquí \(MG = 0{,}5\) significa que si la ganancia **baja** a la mitad (\(K < 1\)), el lazo se vuelve inestable. Con \(P > 0\), decide con Nyquist, no con los márgenes.

**3. Entiende**

Los márgenes son una lectura local de la curva de Nyquist cerca de \(-1\). Son fiables cuando \(L\) es estable, de fase mínima y cruza una sola vez 0 dB y \(-180^\circ\). Fuera de esos casos, cuenta vueltas.

**4. Cierra**

Añade a tu formulario: **márgenes de Bode → solo con \(P = 0\) y un cruce; en cualquier otro caso, \(Z = N + P\).**

#### Ejercicios del tema

1. \(L(s) = \dfrac{K}{s(s+4)^2}\). Halla el \(K\) máximo y la frecuencia de oscilación.

   <details><summary>Solución</summary>

   \(j\omega(j\omega+4)^2 = -8\omega^2 + j(16\omega - \omega^3)\). Parte imaginaria nula en \(\omega = 4\); ahí la real vale \(-128\). Cruce en \(-K/128\): estable si \(0 < K < 128\), y oscila a 4 rad/s en el límite.

   </details>

2. \(L(s) = \dfrac{K(s+3)}{s(s-1)}\) (un polo en el origen y otro inestable). ¿Para qué \(K\) es estable el lazo cerrado?

   <details><summary>Solución</summary>

   \(P = 1\). La curva cruza el eje real en \(\omega = \sqrt3\) con valor \(-K\). Si \(K > 1\), rodea \(-1\) una vez en sentido antihorario: \(N = -1\), \(Z = 0\). Comprobación: \(s^2 + (K-1)s + 3K\) es estable si \(K > 1\). Con python-control: `ct.nyquist_response(ct.tf([2, 6], [1, -1, 0])).count` devuelve `-1`.

   </details>

**Hito del tema:**

- [ ] Analicé un lazo con integrador sin contar el polo del origen en \(P\).
- [ ] Calculé \(MG\), \(MF\) y la distancia mínima a \(-1\) de \(3/(s(s+1)(s+2))\).
- [ ] Mostré con \(2/(s-1)\) que \(MG < 1\) no implica inestabilidad.
- [ ] Escribí la regla de cuándo usar márgenes y cuándo contar vueltas.

**Fuentes oficiales:** [margin y nyquist_plot, python-control](https://python-control.readthedocs.io/en/latest/generated/control.nyquist_plot.html) y [Control Tutorials (U. de Michigan), métodos en frecuencia](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).
