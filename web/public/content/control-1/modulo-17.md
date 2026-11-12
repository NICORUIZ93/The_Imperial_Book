# Módulo 17: Lugar geométrico de las raíces

Cuando subes la ganancia \(K\) de un lazo, los polos de lazo cerrado se mueven. El lugar de las raíces es el dibujo de ese camino, y con él eliges \(K\) para poner los polos en la zona de diseño.

**Al terminar podrás:**

- Entender las condiciones de ángulo y de magnitud.
- Dibujar el lugar con las reglas, de forma justificada.
- Calcular el punto de quiebre, las asíntotas y el cruce con el eje imaginario.
- Hallar \(K\) para un \(\zeta\) deseado.

## Aprende construyendo

### Tema 1: Las dos condiciones

**¿Por qué es importante?** Las condiciones de ángulo y magnitud son la base de todo el método: deciden qué puntos son polos posibles y con qué ganancia.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

Con realimentación unitaria y ganancia \(K\), los polos de lazo cerrado cumplen \(1 + KG(s) = 0\), es decir \(KG(s) = -1\). El número \(-1\) tiene magnitud 1 y ángulo 180°:

\[\angle G(s) = \pm180°(2k+1) \qquad\qquad K = \frac{1}{|G(s)|}\]

*Condición de ángulo: decide qué puntos están en el lugar. Condición de magnitud: dice qué \(K\) lleva el polo a ese punto.*

#### Demostración · Cómo se evalúan (geometría)

Si \(G(s) = \dfrac{\prod(s-z_i)}{\prod(s-p_j)}\), cada factor \((s - p)\) es un vector que va del polo \(p\) al punto \(s\). Por la forma polar (capítulo 2), el ángulo de un producto es la suma de ángulos y la magnitud es el producto de magnitudes:

\[\angle G = \sum\angle(s-z_i) - \sum\angle(s-p_j) \qquad |G| = \frac{\prod|s-z_i|}{\prod|s-p_j|}\]

∎

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · ¿Está \(-2+2j\) en el lugar de \(K\,/(s(s+4))\)? · *Básico*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx -180^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

2. Está en el lugar. Magnitud: \(K = \dfrac{1}{|G(s)|_{K=1}} \approx 8\).

   **¿Por qué?** Condición de magnitud \(|KG(s)| = 1\): producto de distancias a los polos / producto de distancias a los ceros.

**Resultado.** Sí, con \(K \approx 8\).

#### Ejemplo 2 · ¿Está \(-1+1j\) en el lugar de \(K\,/(s(s+4))\)? · *Básico*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx -153{,}4^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

**Resultado.** No: el ángulo es -153,4°, no ±180°.

#### Ejemplo 3 · ¿Está \(-2+3j\) en el lugar de \(K\,/((s+1)(s+3))\)? · *Básico*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx -180^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

2. Está en el lugar. Magnitud: \(K = \dfrac{1}{|G(s)|_{K=1}} \approx 10\).

   **¿Por qué?** Condición de magnitud \(|KG(s)| = 1\): producto de distancias a los polos / producto de distancias a los ceros.

**Resultado.** Sí, con \(K \approx 10\).

#### Ejemplo 4 · ¿Está \(-0{,}5+1j\) en el lugar de \(K\,/(s(s+2)(s+4))\)? · *Intermedio*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx -166{,}2^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

**Resultado.** No: el ángulo es -166,2°, no ±180°.

#### Ejemplo 5 · ¿Está \(-3+1{,}732j\) en el lugar de \(K\,(s+3)/(s(s+1))\)? · *Intermedio*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx 160{,}9^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

**Resultado.** No: el ángulo es 160,9°, no ±180°.

#### Ejemplo 6 · ¿Está \(-3+4j\) en el lugar de \(K\,/(s(s+6))\)? · *Básico*

**Enunciado.** Usa la condición de ángulo y, si está, halla \(K\) con la de magnitud.

1. Ángulo de \(G(s)\) en el punto: suma de ángulos de los ceros − suma de ángulos de los polos \(\approx -180^\circ\).

   **¿Por qué?** Un punto está en el lugar solo si ese ángulo es ±180° (múltiplo impar de 180°).

2. Está en el lugar. Magnitud: \(K = \dfrac{1}{|G(s)|_{K=1}} \approx 25\).

   **¿Por qué?** Condición de magnitud \(|KG(s)| = 1\): producto de distancias a los polos / producto de distancias a los ceros.

**Resultado.** Sí, con \(K \approx 25\).

### Tema 2: Reglas de construcción (con su porqué)

**¿Por qué es importante?** Con las reglas dibujas a mano cómo se mueven los polos al cambiar la ganancia y eliges el \(K\) que cumple las especificaciones.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

Escribe \(G = N(s)/D(s)\), con \(n\) polos y \(m\) ceros. La ecuación característica es \(D(s) + KN(s) = 0\).

1. **Número de ramas:** \(n\). *Porque* \(D + KN\) tiene grado \(n\).
2. **Simetría** respecto al eje real. *Porque* los coeficientes son reales y las raíces complejas vienen conjugadas (capítulo 2).
3. **Empieza en los polos y termina en los ceros.** *Porque* con \(K=0\) queda \(D=0\), y con \(K\to\infty\) hay que dividir por \(K\): \(D/K + N = 0 \to N = 0\). Las \(n-m\) ramas que sobran se van al infinito.
4. **Eje real:** un punto del eje real está en el lugar si a su derecha hay un número *impar* de polos y ceros reales. *Porque* cada pareja compleja aporta ángulos que se cancelan, los polos y ceros a la izquierda aportan 0° y cada uno a la derecha aporta 180°. Para sumar 180° se necesita una cantidad impar.
5. **Asíntotas:** las \(n-m\) ramas que van al infinito siguen rectas con ángulos \(\dfrac{180°(2k+1)}{n-m}\) que salen del centroide \(\sigma_a = \dfrac{\sum p_j - \sum z_i}{n-m}\). *Porque* lejos del origen todos los vectores apuntan casi igual: \(G \approx 1/(s-\sigma_a)^{n-m}\).
6. **Punto de quiebre** (donde dos ramas se juntan o se separan del eje real): despeja \(K = -D(s)/N(s)\) y resuelve \(\dfrac{dK}{ds} = 0\). *Porque* en el eje real \(K\) alcanza un máximo justo donde dos raíces reales chocan.
7. **Cruce con el eje imaginario:** con Routh (capítulo 16), el \(K\) que anula una fila y el polinomio auxiliar.

#### Ejemplo 1 · Dos polos · *Básico*

**Enunciado.** \(G = \dfrac{1}{s(s+2)}\). Dibuja el lugar y halla \(K\) para \(\zeta = 0{,}5\).

1. Marca los polos: 0 y −2. No hay ceros.

   **¿Por qué?** Las ramas empiezan en los polos (regla 3).

2. Eje real: entre −2 y 0 hay 1 polo a la derecha (impar), así que el segmento [−2, 0] es del lugar.

   **¿Por qué?** Regla 4.

3. Asíntotas: \(n - m = 2\), ángulos \(\pm90°\), centroide \(\dfrac{0+(-2)}{2} = -1\).

   **¿Por qué?** Regla 5.

4. Quiebre: \(K = -s(s+2) = -s^2-2s\); \(\dfrac{dK}{ds} = -2s - 2 = 0 \Rightarrow s = -1\).

   **¿Por qué?** Regla 6: las ramas chocan en −1 y se separan hacia arriba y abajo por la vertical.

5. \(\zeta = 0{,}5\) es la recta de 60° desde el origen. Corta la vertical \(\sigma = -1\) en \(-1\pm1{,}73j\).

   **¿Por qué?** \(\tan60° = 1{,}73\).

6. \(K = |s|\cdot|s+2|\) en ese punto: \(|-1+1{,}73j| = 2\) y \(|1+1{,}73j| = 2\). \(K = 4\).

   **¿Por qué?** Condición de magnitud: \(K = 1/|G|\).

**Resultado:** \(K = 4\), igual que en capítulo 13

#### Ejemplo 2 · Tres polos · *Nivel parcial*

> **Qué cambia respecto al anterior:** Un tercer polo: aparecen tres asíntotas y un cruce con el eje imaginario.

**Enunciado.** \(G = \dfrac{1}{s(s+1)(s+2)}\).

1. Eje real: [−1, 0] (1 polo a la derecha) y \((-\infty, -2]\) (3 polos a la derecha).

   **¿Por qué?** Regla 4: números impares.

2. Asíntotas: \(n - m = 3\), ángulos 60°, 180°, 300°, centroide \(\dfrac{0-1-2}{3} = -1\).

   **¿Por qué?** Regla 5.

3. Quiebre: \(K = -(s^3+3s^2+2s)\); \(3s^2+6s+2 = 0 \Rightarrow s = -0{,}423\) o \(-1{,}577\). Solo \(-0{,}423\) está en el lugar.

   **¿Por qué?** \(-1{,}577\) cae entre −2 y −1, que no es parte del lugar.

4. Cruce con \(j\omega\): por Routh (capítulo 16), \(K = 6\) en \(\pm j1{,}41\).

   **¿Por qué?** Regla 7.

5. \(\zeta = 0{,}5\): en el simulador mueve \(K\) hasta que los polos queden sobre la recta verde: \(K \approx 1{,}04\), polos \(-0{,}33\pm0{,}58j\).

   **¿Por qué?** Cumple la condición de ángulo en ese punto.

**Resultado:** Estable para \(K < 6\); con \(K = 1{,}04\), \(\zeta = 0{,}5\)

```anatomy
control-1-lugar-raices
```

*Lugar de las raíces de \(\dfrac{K}{s(s+1)(s+2)}\). Mueve \(K\) y observa los polos (cruces naranjas). Pasando \(K = 6\) cruzan al semiplano derecho.*

#### Ejemplo 3 · Con un cero · *Nivel parcial*

> **Qué cambia respecto al anterior:** Hay un cero.

**Enunciado.** \(G = \dfrac{s+3}{s(s+1)}\).

1. Eje real: [−1, 0] y \((-\infty, -3]\).

   **¿Por qué?** Ahora el cero también cuenta en la regla 4.

2. \(n - m = 1\): una sola asíntota, a 180°.

   **¿Por qué?** El cero “absorbe” una rama.

3. Quiebre: \(K = -\dfrac{s(s+1)}{s+3}\); \(\dfrac{dK}{ds} = 0 \Rightarrow s^2+6s+3 = 0 \Rightarrow -0{,}551\) y \(-5{,}449\).

   **¿Por qué?** Una rama sale del eje en −0,551 y vuelve a entrar en −5,449.

4. Entre esos puntos el lugar es un círculo con centro en −3 y radio \(\sqrt6\).

   **¿Por qué?** Ese radio es la distancia del cero a cualquiera de los dos puntos de quiebre.

**Resultado:** El cero jala el lugar hacia la izquierda: más estable

#### Errores comunes

- Contar solo polos y no ceros en la regla del eje real.
- Calcular el centroide sin restar la suma de los ceros.
- Tomar una raíz de \(dK/ds = 0\) que no está en el lugar.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 4 · Reglas del lugar de \(K\frac{1}{s \left(s + 1\right) \left(s + 5\right)}\) · *Intermedio*

**Enunciado.** Halla asíntotas, centroide, puntos de ruptura y cruce con el eje imaginario.

1. Polos \(-5, -1, 0\): 3 ramas van al infinito.

   **¿Por qué?** Cada rama sale de un polo; \(m\) terminan en ceros y \(n-m\) en el infinito.

2. Centroide \(\sigma_a = \dfrac{\sum p - \sum z}{n-m} = -2\); ángulos \(60^\circ, 180^\circ, 300^\circ\).

   **¿Por qué?** Las asíntotas salen del centroide con ángulos \((2k+1)180^\circ/(n-m)\).

3. Ruptura: \(dK/ds = 0\) da \(s\approx-0{,}472\).

   **¿Por qué?** Donde dos ramas sobre el eje real se encuentran, \(K\) es máximo local sobre ese tramo.

4. Cruce con el eje imaginario (Routh): \(K = 30\), en \(\omega \approx 2{,}236\) rad/s.

   **¿Por qué?** Es el valor de \(K\) que anula la fila \(s^1\).

**Resultado.** Estable para \(0 < K < 30\).

#### Ejemplo 5 · Reglas del lugar de \(K\frac{1}{s \left(s + 3\right) \left(s + 6\right)}\) · *Intermedio*

**Enunciado.** Halla asíntotas, centroide, puntos de ruptura y cruce con el eje imaginario.

1. Polos \(-6, -3, 0\): 3 ramas van al infinito.

   **¿Por qué?** Cada rama sale de un polo; \(m\) terminan en ceros y \(n-m\) en el infinito.

2. Centroide \(\sigma_a = \dfrac{\sum p - \sum z}{n-m} = -3\); ángulos \(60^\circ, 180^\circ, 300^\circ\).

   **¿Por qué?** Las asíntotas salen del centroide con ángulos \((2k+1)180^\circ/(n-m)\).

3. Ruptura: \(dK/ds = 0\) da \(s\approx-1{,}268\).

   **¿Por qué?** Donde dos ramas sobre el eje real se encuentran, \(K\) es máximo local sobre ese tramo.

4. Cruce con el eje imaginario (Routh): \(K = 162\), en \(\omega \approx 4{,}243\) rad/s.

   **¿Por qué?** Es el valor de \(K\) que anula la fila \(s^1\).

**Resultado.** Estable para \(0 < K < 162\).

#### Ejemplo 6 · Reglas del lugar de \(K\frac{s + 2}{s \left(s + 1\right) \left(s + 6\right)}\) · *Avanzado*

**Enunciado.** Halla asíntotas, centroide, puntos de ruptura y cruce con el eje imaginario.

1. Polos \(-6, -1, 0\), ceros \(-2\): 2 ramas van al infinito.

   **¿Por qué?** Cada rama sale de un polo; \(m\) terminan en ceros y \(n-m\) en el infinito.

2. Centroide \(\sigma_a = \dfrac{\sum p - \sum z}{n-m} = - \frac{5}{2}\approx -2{,}5\); ángulos \(90^\circ, 270^\circ\).

   **¿Por qué?** Las asíntotas salen del centroide con ángulos \((2k+1)180^\circ/(n-m)\).

3. Ruptura: \(dK/ds = 0\) da \(s\approx-0{,}563\).

   **¿Por qué?** Donde dos ramas sobre el eje real se encuentran, \(K\) es máximo local sobre ese tramo.

**Resultado.** No cruza al semiplano derecho: estable para todo \(K > 0\).

#### Ejemplo 7 · Reglas del lugar de \(K\frac{1}{\left(s + 1\right) \left(s + 2\right) \left(s + 4\right)}\) · *Intermedio*

**Enunciado.** Halla asíntotas, centroide, puntos de ruptura y cruce con el eje imaginario.

1. Polos \(-4, -2, -1\): 3 ramas van al infinito.

   **¿Por qué?** Cada rama sale de un polo; \(m\) terminan en ceros y \(n-m\) en el infinito.

2. Centroide \(\sigma_a = \dfrac{\sum p - \sum z}{n-m} = - \frac{7}{3}\approx -2{,}333\); ángulos \(60^\circ, 180^\circ, 300^\circ\).

   **¿Por qué?** Las asíntotas salen del centroide con ángulos \((2k+1)180^\circ/(n-m)\).

3. Ruptura: \(dK/ds = 0\) da \(s\approx-1{,}451\).

   **¿Por qué?** Donde dos ramas sobre el eje real se encuentran, \(K\) es máximo local sobre ese tramo.

4. Cruce con el eje imaginario (Routh): \(K = 90\), en \(\omega \approx 3{,}742\) rad/s.

   **¿Por qué?** Es el valor de \(K\) que anula la fila \(s^1\).

**Resultado.** Estable para \(0 < K < 90\).

### Tema 3: Elegir K desde el lugar de las raíces

**¿Por qué es importante?** El lugar de las raíces se dibuja para decidir: con él se elige la ganancia que da el amortiguamiento o la rapidez pedidos, que es lo que se pregunta en el examen y lo que se hace al ajustar un controlador real.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

Cuando el lazo es de segundo orden, todo el lugar se puede escribir con la ecuación característica \(s^2 + as + K = 0\):

- Mientras \(K < a^2/4\) los dos polos son reales; en \(K = a^2/4\) se juntan (punto de ruptura en \(-a/2\)); para \(K\) mayor se separan verticalmente con parte real fija \(-a/2\).

- Por eso el tiempo de establecimiento \(4/(a/2)\) **no cambia** al subir \(K\), pero el sobrepico sí aumenta.

**Receta:** (1) escribe la ecuación característica; (2) compárala con \(s^2 + 2\zeta\omega_ns + \omega_n^2\); (3) con el \(\zeta\) pedido despeja \(\omega_n\); (4) \(K\) es el término independiente.

Para órdenes mayores se usa la recta de \(\zeta\) constante (ángulo \(\theta = \arccos\zeta\)) y la condición de magnitud en el punto donde corta el lugar.

#### Ejemplos resueltos

#### Ejemplo 1 · Elegir K para ζ = 0,5 en \(\dfrac{K}{s(s+4)}\) · *Básico*

**Enunciado.** Realimentación unitaria. ¿Qué \(K\) da ese amortiguamiento y qué especificaciones resultan?

1. Lazo cerrado: \(s^2 + 4s + K = 0\).

   **¿Por qué?** Ecuación característica \(1 + G = 0\).

2. Compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\): \(2\zeta\omega_n = 4 \Rightarrow \omega_n = 4\).

   **¿Por qué?** El coeficiente de \(s\) no depende de \(K\): todas las ramas complejas tienen la misma parte real \(-4/2\).

3. \(K = \omega_n^2 \approx 16\).

   **¿Por qué?** El término independiente es \(K\).

**Resultado.** \(K \approx 16\): \(M_p \approx 16{,}3\,\%\), \(t_s \approx 2\,\text{s}\).

#### Ejemplo 2 · Elegir K para ζ = 0,6 en \(\dfrac{K}{s(s+6)}\) · *Básico*

**Enunciado.** Realimentación unitaria. ¿Qué \(K\) da ese amortiguamiento y qué especificaciones resultan?

1. Lazo cerrado: \(s^2 + 6s + K = 0\).

   **¿Por qué?** Ecuación característica \(1 + G = 0\).

2. Compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\): \(2\zeta\omega_n = 6 \Rightarrow \omega_n = 5\).

   **¿Por qué?** El coeficiente de \(s\) no depende de \(K\): todas las ramas complejas tienen la misma parte real \(-6/2\).

3. \(K = \omega_n^2 \approx 25\).

   **¿Por qué?** El término independiente es \(K\).

**Resultado.** \(K \approx 25\): \(M_p \approx 9{,}5\,\%\), \(t_s \approx 1{,}333\,\text{s}\).

#### Ejemplo 3 · Elegir K para ζ = 0,707 en \(\dfrac{K}{s(s+2)}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Qué \(K\) da ese amortiguamiento y qué especificaciones resultan?

1. Lazo cerrado: \(s^2 + 2s + K = 0\).

   **¿Por qué?** Ecuación característica \(1 + G = 0\).

2. Compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\): \(2\zeta\omega_n = 2 \Rightarrow \omega_n = 1{,}414\).

   **¿Por qué?** El coeficiente de \(s\) no depende de \(K\): todas las ramas complejas tienen la misma parte real \(-2/2\).

3. \(K = \omega_n^2 \approx 2{,}001\).

   **¿Por qué?** El término independiente es \(K\).

**Resultado.** \(K \approx 2{,}001\): \(M_p \approx 4{,}3\,\%\), \(t_s \approx 4\,\text{s}\).

#### Ejemplo 4 · Elegir K para ζ = 0,4 en \(\dfrac{K}{s(s+10)}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Qué \(K\) da ese amortiguamiento y qué especificaciones resultan?

1. Lazo cerrado: \(s^2 + 10s + K = 0\).

   **¿Por qué?** Ecuación característica \(1 + G = 0\).

2. Compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\): \(2\zeta\omega_n = 10 \Rightarrow \omega_n = 12{,}5\).

   **¿Por qué?** El coeficiente de \(s\) no depende de \(K\): todas las ramas complejas tienen la misma parte real \(-10/2\).

3. \(K = \omega_n^2 \approx 156{,}25\).

   **¿Por qué?** El término independiente es \(K\).

**Resultado.** \(K \approx 156{,}25\): \(M_p \approx 25{,}4\,\%\), \(t_s \approx 0{,}8\,\text{s}\).

#### Ejemplo 5 · Elegir K para ζ = 0,8 en \(\dfrac{K}{s(s+5)}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Qué \(K\) da ese amortiguamiento y qué especificaciones resultan?

1. Lazo cerrado: \(s^2 + 5s + K = 0\).

   **¿Por qué?** Ecuación característica \(1 + G = 0\).

2. Compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\): \(2\zeta\omega_n = 5 \Rightarrow \omega_n = 3{,}125\).

   **¿Por qué?** El coeficiente de \(s\) no depende de \(K\): todas las ramas complejas tienen la misma parte real \(-5/2\).

3. \(K = \omega_n^2 \approx 9{,}766\).

   **¿Por qué?** El término independiente es \(K\).

**Resultado.** \(K \approx 9{,}766\): \(M_p \approx 1{,}5\,\%\), \(t_s \approx 1{,}6\,\text{s}\).

