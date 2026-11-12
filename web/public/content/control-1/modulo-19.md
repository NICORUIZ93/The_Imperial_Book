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

### Tema 2: Diseño de un atraso

**¿Por qué es importante?** El atraso reduce el error final sin dañar el transitorio, algo que la ganancia sola no puede lograr.

#### Demostración · el atraso multiplica el error sin mover los polos

1. En \(s = 0\): \(G_c(0) = K_c\dfrac{z}{p}\). Si \(K_c = 1\) y \(z/p = 10\), \(K_v\) se multiplica por 10.
2. Cerca de los polos dominantes \(s_d\) (lejos del origen), \(\dfrac{s_d+z}{s_d+p} \approx 1\) en magnitud y casi 0° en ángulo, porque \(z\) y \(p\) son muy pequeños comparados con \(|s_d|\).
3. Así que el lugar de las raíces, y por lo tanto el transitorio, casi no cambia.

∎

#### Ejemplo 2 · Atraso: diez veces menos error · *Experto*

> **Qué cambia respecto al anterior:** Ahora se busca menos error, no más velocidad.

**Enunciado.** Misma planta (\(K_v = 2\)). Se quiere \(K_v = 20\) sin cambiar el transitorio.

1. Necesitas multiplicar \(K_v\) por 10, así que \(z/p = 10\).

   **¿Por qué?** El atraso multiplica la ganancia en \(s = 0\) por \(z/p\) (demostración arriba).

2. Elige \(z\) y \(p\) pequeños: \(z = 0{,}1\), \(p = 0{,}01\).

   **¿Por qué?** Cerca del origen casi no tocan el lugar donde están los polos dominantes.

3. Comprueba el ángulo en \(s_d = -1+1{,}73j\): \(117{,}5° - 119{,}8° = -2{,}3°\).

   **¿Por qué?** Menos de 5° se considera despreciable.

**Resultado:** \(G_c = \dfrac{s+0{,}1}{s+0{,}01}\): \(K_v = 20\), error ante rampa 0,05

### Tema 3: Implementación con op-amps

**¿Por qué es importante?** Implementar el compensador con op-amps conecta el diseño en papel con un circuito real.

Dos inversores en cascada: el primero con \(Z_i = R_1\parallel C_1\) y \(Z_f = R_2\parallel C_2\); el segundo con \(R_3\) y \(R_4\) para corregir el signo y la ganancia.

\[G_c(s) = \frac{R_4R_2}{R_3R_1}\cdot\frac{R_1C_1s+1}{R_2C_2s+1} = \frac{R_4C_1}{R_3C_2}\cdot\frac{s+\frac{1}{R_1C_1}}{s+\frac{1}{R_2C_2}}\]

*Adelanto si \(R_1C_1 > R_2C_2\); atraso si \(R_1C_1 < R_2C_2\).*

#### Demostración

Con capítulo 8: \(Z_i = \dfrac{R_1}{1+sR_1C_1}\), \(Z_f = \dfrac{R_2}{1+sR_2C_2}\). La primera etapa da \(-\dfrac{R_2}{R_1}\cdot\dfrac{1+sR_1C_1}{1+sR_2C_2}\), y la segunda \(-R_4/R_3\). El producto quita el signo. Para la segunda forma, saca \(R_1C_1\) y \(R_2C_2\) como factor común.

∎
