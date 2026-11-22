# Módulo 28: Simulacro de examen final

El módulo 22 trae un simulacro de parcial (unidades 1 a 4). Este simulacro cubre lo que pide el examen final de Control I: respuesta en frecuencia, Nyquist, compensación en frecuencia, espacio de estados con observador y método algebraico. Son seis puntos para resolver en 90 minutos, en dos bloques de 45, con una calculadora, el formulario del módulo 22 y las reglas que anotaste en los pasos «Cierra» de los módulos 23 a 27 (criterio \(Z = N + P\), procedimiento del adelanto y del atraso, \(\mathcal C\) y \(\mathcal O\), Ackermann, \(AP + BQ = D\) y \(T = BM/D\)). Después corriges con python-control.

**Al terminar podrás:**

- Resolver en tiempo de examen los seis tipos de problema de las unidades 5, 6 y 7.
- Corregir tus respuestas con un script que reproduce cada resultado.
- Armar un plan de repaso a partir de los puntos fallados.

**Prerrequisitos:** módulos 20 y 23 a 27. **Cómo usarlo:** resuelve cada punto en papel antes de abrir la solución. Anota tu resultado y el tiempo que tardaste; la regla de la metodología es escribir primero tu predicción y después comparar.

## Aprende construyendo

### Tema 1: Bloque A — frecuencia (puntos 1 a 3) · Avanzado · 45 min

**¿Por qué es importante?** La unidad 5 suele valer un tercio del final y mezcla cálculo de márgenes, estabilidad por Nyquist y un diseño. **Modelo mental:** primero el estacionario (\(K\)), después los márgenes, después el compensador.

**Proyecto integrador:** tu hoja de respuestas del simulacro. **Límite:** el tiempo sugerido por punto (15 min) es una guía; si te pasas, anota cuánto.

#### Subtema 1.1: Punto 1 — márgenes de estabilidad · 15 min

**1. Contexto**

Evalúa los módulos 14, 20 y 23: constante de error, cruce de fase y cruce de ganancia.

**2. Hazlo tú**

**Enunciado (20 puntos).** Para \(L(s) = \dfrac{8}{s(s+2)(s+4)}\) en realimentación unitaria:

a) Halla \(K_v\) y el error ante rampa unitaria.
b) Halla la frecuencia de cruce de fase y el margen de ganancia.
c) Halla el margen de fase (puedes resolver numéricamente \(|L(j\omega)| = 1\)).

<details><summary>Solución del punto 1</summary>

a) \(K_v = \lim_{s\to0} sL(s) = 8/8 = 1\). Error ante rampa \(= 1/K_v = 1\).

b) \(L(j\omega) = \dfrac{8}{-6\omega^2 + j\omega(8 - \omega^2)}\). La fase vale \(-180^\circ\) cuando la parte imaginaria del denominador se anula: \(\omega_{pc} = \sqrt8 = 2{,}83\) rad/s. Ahí el denominador vale \(-6\cdot8 = -48\) y \(|L| = 1/6\): \(MG = 6\) (15,56 dB).

c) \(|L(j\omega)| = 1\) en \(\omega_{gc} = 0{,}891\) rad/s. \(\angle L = -90^\circ - \arctan(0{,}891/2) - \arctan(0{,}891/4) = -126{,}6^\circ\): \(MF = 53{,}4^\circ\).

</details>

**Fallo deliberado (típico de examen):** calcular \(MG\) en la frecuencia de cruce de ganancia. **Diagnóstico:** \(MG\) se mide donde la **fase** es \(-180^\circ\); \(MF\) donde la **magnitud** es 1. Escribe las dos definiciones antes de calcular.

**3. Entiende**

El truco del cruce de fase: con \(s = j\omega\), separa el denominador en parte real e imaginaria; la fase es \(-180^\circ\) cuando la parte imaginaria se anula y la real es negativa.

**4. Cierra**

Anota tu \(K_v\), \(MG\) y \(MF\), y el tiempo empleado.

#### Subtema 1.2: Punto 2 — criterio de Nyquist · 15 min

**1. Contexto**

Evalúa el módulo 23 con un lazo abierto inestable y un integrador.

**2. Hazlo tú**

**Enunciado (15 puntos).** \(L(s) = \dfrac{K(s+3)}{s(s-1)}\), con \(K > 0\).

a) ¿Cuánto vale \(P\)? ¿Cómo se trata el polo en el origen?
b) Halla dónde cruza \(L(j\omega)\) el eje real negativo.
c) Con el criterio \(Z = N + P\), halla el rango de \(K\) para estabilidad. Comprueba con Routh.

<details><summary>Solución del punto 2</summary>

a) \(P = 1\) (el polo en \(+1\)). El polo en el origen se esquiva con un semicírculo pequeño y no cuenta en \(P\).

b) \(L(j\omega) = K\,\dfrac{-4}{\omega^2 + 1} + jK\,\dfrac{3 - \omega^2}{\omega(\omega^2+1)}\). La parte imaginaria se anula en \(\omega = \sqrt3\), donde la parte real vale \(-4K/4 = -K\).

c) Si \(K > 1\), el cruce en \(-K\) queda a la izquierda de \(-1\) y la curva rodea \(-1\) una vez en sentido antihorario: \(N = -1\), \(Z = -1 + 1 = 0\), estable. Si \(K < 1\), \(N = +1\) y \(Z = 2\). Routh de \(s^2 + (K-1)s + 3K\): estable si \(K > 1\). Rango: \(K > 1\).

</details>

**Fallo deliberado (típico de examen):** contar el polo del origen en \(P\) (\(P = 2\)). **Diagnóstico:** concluirías que hacen falta dos vueltas antihorarias y declararías inestable un lazo estable. El contorno indentado deja fuera el polo del origen.

**3. Entiende**

Para \(\omega \to 0^+\), la parte real tiende a \(-4K\) y la imaginaria a \(+\infty\) (asíntota vertical); el arco de radio infinito cierra la curva por la izquierda. Dibujarlo ayuda a contar \(N\) sin errores de signo.

**4. Cierra**

Anota \(P\), \(N\) y el rango de \(K\).

#### Subtema 1.3: Punto 3 — compensador de adelanto · 15 min

**1. Contexto**

Evalúa el módulo 24: diseño completo por margen de fase.

**2. Hazlo tú**

**Enunciado (20 puntos).** \(G(s) = \dfrac{1}{s(s+3)}\). Diseña un adelanto \(G_c(s) = K_c\dfrac{s + 1/T}{s + 1/(\alpha T)}\) para \(K_v = 15\ \text{s}^{-1}\) y \(MF \ge 50^\circ\).

<details><summary>Solución del punto 3</summary>

1. \(K_v = K/3 = 15 \Rightarrow K = 45\). \(KG = \dfrac{45}{s(s+3)}\).
2. Cruce sin compensar: \(\omega^4 + 9\omega^2 - 2025 = 0 \Rightarrow \omega_c = 6{,}38\) rad/s. \(MF = 180^\circ - 90^\circ - \arctan(6{,}38/3) = 25{,}2^\circ\).
3. \(\phi_m = 50^\circ - 25{,}2^\circ + 8^\circ = 32{,}8^\circ\). \(\alpha = \dfrac{1 - \sin32{,}8^\circ}{1 + \sin32{,}8^\circ} = 0{,}297\).
4. Nuevo cruce donde \(|KG| = \sqrt\alpha\) (\(-5{,}27\) dB): \(\omega^4 + 9\omega^2 - 2025/\alpha = 0 \Rightarrow \omega_m = 8{,}84\) rad/s.
5. \(T = 1/(\omega_m\sqrt\alpha) = 0{,}2075\): cero en \(4{,}82\), polo en \(16{,}2\), \(K_c = K/\alpha = 151{,}5\).

\[G_c(s) = 151{,}5\,\frac{s + 4{,}82}{s + 16{,}2}\]

Verificación con python-control: \(MF = 51{,}6^\circ\) con los valores exactos y \(51{,}5^\circ\) con los redondeados. Con 5° de corrección se obtiene \(MF = 49{,}1^\circ\) (no cumple).

</details>

**Fallo deliberado (típico de examen):** ubicar el máximo del adelanto en el cruce **sin compensar** (6,38 rad/s). **Diagnóstico:** el adelanto sube la magnitud y corre el cruce; su fase máxima debe caer en el **nuevo** cruce, donde \(|KG| = \sqrt\alpha\).

**3. Entiende**

Si en el examen no te alcanza el tiempo para el paso 4 exacto, léelo en el Bode asintótico: busca dónde la magnitud de \(KG\) vale \(-10\log(1/\alpha)\) dB. Indica que es una aproximación.

**4. Cierra**

Anota tu \(G_c\) y cuánto difiere del de la solución.

#### Ejercicios del tema

1. En el punto 1, ¿qué ganancia haría oscilar el lazo y a qué frecuencia?

   <details><summary>Solución</summary>

   \(K = 8\cdot6 = 48\), oscilando a \(\sqrt8 = 2{,}83\) rad/s (Routh de \(s^3 + 6s^2 + 8s + K\): \(48 > K\)).

   </details>

2. En el punto 3, ¿cuánto vale el sobrepico sin compensar y con compensador?

   <details><summary>Solución</summary>

   Sin compensar, 48,6 %; con el adelanto, 18,9 % (`ct.step_info`).

   </details>

**Hito del tema:**

- [ ] Resolví los puntos 1 a 3 en papel en 45 minutos o menos.
- [ ] Comparé cada resultado con la solución plegada después de escribir el mío.
- [ ] Identifiqué el fallo típico de cada punto en mi hoja, si lo cometí.
- [ ] Anoté el tiempo por punto.

**Fuentes oficiales:** [margin y nyquist_response, python-control](https://python-control.readthedocs.io/en/latest/generated/control.margin.html).

### Tema 2: Bloque B — estado y método algebraico (puntos 4 a 6) · Avanzado · 45 min

**¿Por qué es importante?** Las unidades 6 y 7 se evalúan con cuentas cortas pero encadenadas: un error en \(K\) arrastra \(\bar N\) y el compensador. **Modelo mental:** escribe siempre el polinomio característico con símbolos antes de igualar.

**Proyecto integrador:** tu hoja de respuestas, segunda mitad. **Límite:** igual que en el bloque A, 15 minutos por punto.

#### Subtema 2.1: Punto 4 — observabilidad y cancelación · 15 min

**1. Contexto**

Evalúa el módulo 25.

**2. Hazlo tú**

**Enunciado (10 puntos).** \(A = \begin{bmatrix}0&1\\-6&-5\end{bmatrix}\), \(B = \begin{bmatrix}0\\1\end{bmatrix}\), \(C = [c\ \ 1]\).

a) ¿Para qué valores de \(c\) el sistema no es observable?
b) Halla \(G(s)\) y explica el resultado de a).

<details><summary>Solución del punto 4</summary>

a) \(CA = [-6\ \ \ c - 5]\). \(\det\mathcal O = c(c-5) + 6 = c^2 - 5c + 6 = (c-2)(c-3)\). No es observable si \(c = 2\) o \(c = 3\).

b) \(G(s) = C(sI - A)^{-1}B = \dfrac{s + c}{(s+2)(s+3)}\). Con \(c = 2\) o \(c = 3\) el cero cancela un polo: ese modo no aparece en la salida. El sistema siempre es controlable (forma canónica controlable).

</details>

**Fallo deliberado (típico de examen):** calcular \(\mathcal C\) en vez de \(\mathcal O\). **Diagnóstico:** \(\mathcal C\) no depende de \(C\); si la pregunta cambia \(C\), te pregunta por observabilidad.

**3. Entiende**

Cancelación polo-cero en una realización de orden completo = pérdida de controlabilidad u observabilidad. En forma canónica controlable, es la observabilidad la que se pierde.

**4. Cierra**

Anota los dos valores de \(c\).

#### Subtema 2.2: Punto 5 — controlador con observador · 15 min

**1. Contexto**

Evalúa los módulos 25 y 26.

**2. Hazlo tú**

**Enunciado (20 puntos).** \(A = \begin{bmatrix}0&1\\0&-2\end{bmatrix}\), \(B = \begin{bmatrix}0\\1\end{bmatrix}\), \(C = [1\ \ 0]\).

a) Halla \(K\) para polos en \(-4 \pm 4j\) y \(\bar N\) para error cero ante escalón.
b) Halla \(L\) para polos del observador en \(-16\) (doble).
c) ¿Cuáles son los polos del sistema completo? ¿Qué sobrepico esperas?

<details><summary>Solución del punto 5</summary>

a) \(\det(sI - A + BK) = s^2 + (2 + k_2)s + k_1 = s^2 + 8s + 32\): \(K = [32\ \ 6]\). Lazo cerrado \(\bar N/(s^2 + 8s + 32)\): \(\bar N = 32\).

b) \(\det(sI - A + LC) = s^2 + (2 + l_1)s + (2l_1 + l_2) = s^2 + 32s + 256\): \(l_1 = 30\), \(l_2 = 196\).

c) Separación: \(-4 \pm 4j\), \(-16\), \(-16\). Con \(\zeta = 0{,}707\), \(M_p = 4{,}3\,\%\) y \(t_s \approx 4/4 = 1\) s.

</details>

**Fallo deliberado (típico de examen):** usar \(l_1 = 32\) «porque el coeficiente de \(s\) es 32». **Diagnóstico:** el coeficiente es \(2 + l_1\); la planta ya aporta 2. Escribe \(\det(sI - A + LC)\) completo.

**3. Entiende**

El compensador equivalente es \(C(s) = \dfrac{2136s + 8192}{s^2 + 38s + 468}\), con \(MF = 50{,}7^\circ\) y \(MG = 17\) dB (lo comprueba el script del Tema 3).

**4. Cierra**

Anota \(K\), \(\bar N\), \(L\) y los cuatro polos.

#### Subtema 2.3: Punto 6 — ecuación diofántica y dos parámetros · 15 min

**1. Contexto**

Evalúa el módulo 27.

**2. Hazlo tú**

**Enunciado (15 puntos).** \(G(s) = \dfrac{1}{(s+1)(s+4)}\), \(C(s) = \dfrac{q_1 s + q_0}{s + p_0}\).

a) Halla \(C\) para que los polos del lazo cerrado sean las raíces de \((s^2 + 6s + 18)(s + 8)\).
b) Halla el error ante escalón con realimentación unitaria.
c) Con un compensador de dos parámetros, elige \(M(s)\) para que \(T(s) = \dfrac{18}{s^2 + 6s + 18}\).

<details><summary>Solución del punto 6</summary>

a) \(D = s^3 + 14s^2 + 66s + 144\). \((s^2 + 5s + 4)(s + p_0) + q_1 s + q_0\): \(5 + p_0 = 14 \Rightarrow p_0 = 9\); \(4 + 5p_0 + q_1 = 66 \Rightarrow q_1 = 17\); \(4p_0 + q_0 = 144 \Rightarrow q_0 = 108\). \(C = \dfrac{17s + 108}{s + 9}\).

b) \(T(0) = 108/144 = 0{,}75\): error del 25 %.

c) \(T = \dfrac{M}{D}\). Con \(M = 18(s + 8)\): \(T = \dfrac{18}{s^2 + 6s + 18}\), \(T(0) = 1\), \(M_p = 4{,}3\,\%\).

</details>

**Fallo deliberado (típico de examen):** elegir \(M = 18\) constante. **Diagnóstico:** \(T(0) = 18/144 = 0{,}125\); para cancelar el polo en \(-8\) que tú elegiste, \(M\) debe contener \((s + 8)\).

**3. Entiende**

El diseño de un parámetro da \(M_p = 5{,}1\,\%\) y error del 25 %; el de dos parámetros, \(M_p = 4{,}3\,\%\) y error cero, con los mismos polos.

**4. Cierra**

Anota \(C\), \(M\) y el error.

#### Ejercicios del tema

1. En el punto 5, si solo se mide la velocidad (\(C = [0\ \ 1]\)), ¿se puede diseñar el observador?

   <details><summary>Solución</summary>

   No: \(\mathcal O = \begin{bmatrix}0&1\\0&-2\end{bmatrix}\) tiene rango 1. La posición no se puede reconstruir desde la velocidad.

   </details>

2. En el punto 6, ¿cómo eliminarías el error con realimentación unitaria?

   <details><summary>Solución</summary>

   Con un integrador en \(P = s(s + p_0)\), un \(Q\) de grado 2 y un \(D\) de grado 4 (módulo 27, Subtema 2.3).

   </details>

**Hito del tema:**

- [ ] Resolví los puntos 4 a 6 en papel en 45 minutos o menos.
- [ ] Comparé cada resultado con la solución plegada.
- [ ] Revisé si cometí el fallo típico de cada punto.
- [ ] Anoté el tiempo por punto.

**Fuentes oficiales:** [ctrb, obsv y acker, python-control](https://python-control.readthedocs.io/en/latest/generated/control.obsv.html).

### Tema 3: Corrige con python-control y planea el repaso · Avanzado · 30 min

**¿Por qué es importante?** Corregir solo mirando la solución esconde los errores de cuenta. Un script que recalcula todo te muestra exactamente dónde te desviaste. **Modelo mental:** el script es el profesor que revisa paso a paso.

**Proyecto integrador:** `corrige_final.py`, un script que reproduce los seis resultados. **Límite:** el script verifica números; la justificación escrita la evalúas tú con la solución.

#### Subtema 3.1: Corrige el bloque A · 10 min

**1. Contexto**

Cada resultado numérico de los puntos 1 a 3 se puede reproducir en pocas líneas.

**2. Hazlo tú**

Guarda en `academia-labs/control-1/corrige_final.py`:

```python
# corrige_final.py
import numpy as np
import control as ct

# Punto 1
L1 = ct.tf([8], [1, 6, 8, 0])
gm, pm, w_pc, w_gc = ct.margin(L1)
print("P1: MG =", round(20 * np.log10(gm), 2), "dB en", round(w_pc, 2), "| MF =", round(pm, 1), "en", round(w_gc, 3))

# Punto 2
for K in (0.5, 2):
    L2 = ct.tf([K, 3 * K], [1, -1, 0])
    N = ct.nyquist_response(L2).count
    print(f"P2: K={K} N={N} Z={N + 1}")

# Punto 3
G3 = ct.tf([1], [1, 3, 0])
Gc = 151.5 * ct.tf([1, 4.82], [1, 16.2])
_, pm3, _, wc3 = ct.margin(Gc * G3)
print("P3: MF =", round(pm3, 1), "en", round(wc3, 2), "| Kv =", round(151.5 * 4.82 / 16.2 / 3, 2))
```

**Resultado esperado:**

```text
P1: MG = 15.56 dB en 2.83 | MF = 53.4 en 0.891
P2: K=0.5 N=1 Z=2
P2: K=2 N=-1 Z=0
P3: MF = 51.5 en 8.85 | Kv = 15.03
```

**Fallo deliberado:** en el punto 2 calcula `Z = N + 2` (contando el integrador en \(P\)). **Resultado observado:** \(K = 2\) daría \(Z = 1\), en contradicción con Routh. **Diagnóstico:** el script repite tu error si se lo das; por eso se contrasta con un segundo método (Routh o los polos).

**3. Entiende**

\(K_v = 15{,}03\) y no 15 exacto por el redondeo de \(K_c\), del cero y del polo. En el examen, redondear a tres cifras significativas es aceptable si lo indicas.

**4. Cierra**

Marca en tu hoja cada número que no coincide con el script.

#### Subtema 3.2: Corrige el bloque B · 10 min

**1. Contexto**

Los puntos 4 a 6 se verifican con SymPy (el determinante con parámetro) y con python-control (ganancias y polos).

**2. Hazlo tú**

Añade a `corrige_final.py`:

```python
import sympy as sp

# Punto 4
c = sp.symbols("c")
A4 = sp.Matrix([[0, 1], [-6, -5]])
C4 = sp.Matrix([[c, 1]])
print("P4: det O =", sp.factor(C4.col_join(C4 * A4).det()))

# Punto 5
A5 = np.array([[0.0, 1], [0, -2]])
B5 = np.array([[0.0], [1]])
C5 = np.array([[1.0, 0]])
K5 = np.reshape(ct.acker(A5, B5, [-4 + 4j, -4 - 4j]), (1, 2))
L5 = np.reshape(ct.acker(A5.T, C5.T, [-16, -16]), (2, 1))
N5 = -1 / (C5 @ np.linalg.inv(A5 - B5 @ K5) @ B5)
print("P5: K =", K5.ravel().tolist(), "N =", round(N5.item(), 6), "L =", L5.ravel().tolist())

# Punto 6
D6 = [1, 14, 66, 144]
for nombre, num in (("un parametro", [17, 108]), ("dos parametros", [18, 144])):
    T6 = ct.tf(num, D6)
    print(f"P6 {nombre}: T(0) =", round(float(ct.dcgain(T6)), 3), "Mp =", round(ct.step_info(T6)["Overshoot"], 1))
```

**Resultado esperado:**

```text
P4: det O = (c - 3)*(c - 2)
P5: K = [32.0, 6.0] N = 32.0 L = [30.0, 196.0]
P6 un parametro: T(0) = 0.75 Mp = 5.1
P6 dos parametros: T(0) = 1.0 Mp = 4.3
```

**Fallo deliberado:** en el punto 6 escribe `[18, 144]` como `[18, 8]`. **Diagnóstico:** \(M = 18(s+8) = 18s + 144\); al pasar un polinomio a lista de coeficientes, multiplica primero.

**3. Entiende**

Si tu \(K\) o tu \(L\) difieren, revisa el coeficiente que aporta la planta (el 2 de \(A_{22} = -2\)). Si tu \(D\) difiere, revisa la expansión de \((s^2 + 6s + 18)(s + 8)\).

**4. Cierra**

Completa la corrección y suma tu puntaje sobre 100.

#### Subtema 3.3: Planea el repaso · 10 min

**1. Contexto**

El valor del simulacro está en el plan que sale de él.

**2. Hazlo tú**

Copia esta tabla en tu cuaderno y llénala:

| Punto | Puntos obtenidos | Error principal | Módulo a repasar |
|---|---|---|---|
| 1 | /20 | | 14, 20 |
| 2 | /15 | | 23 |
| 3 | /20 | | 24 |
| 4 | /10 | | 25 |
| 5 | /20 | | 25, 26 |
| 6 | /15 | | 27 |

**Resultado esperado:** una fila por punto con el módulo que repasarás primero.

**Fallo deliberado:** repasar todo de nuevo desde el módulo 20. **Diagnóstico:** el tiempo antes del examen es limitado; repasa primero los puntos con menos puntaje y más peso.

**3. Entiende**

Regla de repaso: menos de 60 % en un punto → rehaz el tema completo del módulo indicado y sus ejercicios; entre 60 % y 85 % → rehaz solo los ejercicios plegados; más de 85 % → pasa al siguiente.

**4. Cierra**

Agenda en tu calendario los módulos a repasar y repite el simulacro una semana después sin mirar las soluciones.

#### Ejercicios del tema

1. Modifica `corrige_final.py` para imprimir el sobrepico de los puntos 3 y 5.

   <details><summary>Solución</summary>

   Punto 3: `ct.step_info(ct.feedback(Gc * G3, 1))["Overshoot"]` da unos 19 %. Punto 5: arma el sistema de cuatro estados como en el módulo 26 (Subtema 3.1) con \(K\), \(L\) y \(\bar N\); el sobrepico es 4,3 %.

   </details>

2. ¿Qué punto del simulacro se puede resolver por dos métodos distintos? Resuélvelo por el segundo.

   <details><summary>Solución</summary>

   El punto 2: por Nyquist y por Routh (\(s^2 + (K-1)s + 3K\)). También el punto 5 a): por igualación de coeficientes y por Ackermann.

   </details>

**Hito del tema:**

- [ ] Ejecuté `corrige_final.py` y comparé los seis puntos.
- [ ] Encontré la causa de cada diferencia con mi hoja.
- [ ] Llené la tabla de repaso con puntajes y módulos.
- [ ] Agendé el repaso y una segunda vuelta del simulacro.

**Fuentes oficiales:** [Documentación de python-control](https://python-control.readthedocs.io/en/latest/) y [SymPy: matrices](https://docs.sympy.org/latest/tutorials/intro-tutorial/matrices.html).
