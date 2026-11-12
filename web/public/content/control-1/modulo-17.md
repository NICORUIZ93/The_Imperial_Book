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

Con realimentación unitaria y ganancia \(K\), los polos de lazo cerrado cumplen \(1 + KG(s) = 0\), es decir \(KG(s) = -1\). El número \(-1\) tiene magnitud 1 y ángulo 180°:

\[\angle G(s) = \pm180°(2k+1) \qquad\qquad K = \frac{1}{|G(s)|}\]

*Condición de ángulo: decide qué puntos están en el lugar. Condición de magnitud: dice qué \(K\) lleva el polo a ese punto.*

#### Demostración · Cómo se evalúan (geometría)

Si \(G(s) = \dfrac{\prod(s-z_i)}{\prod(s-p_j)}\), cada factor \((s - p)\) es un vector que va del polo \(p\) al punto \(s\). Por la forma polar (capítulo 2), el ángulo de un producto es la suma de ángulos y la magnitud es el producto de magnitudes:

\[\angle G = \sum\angle(s-z_i) - \sum\angle(s-p_j) \qquad |G| = \frac{\prod|s-z_i|}{\prod|s-p_j|}\]

∎

### Tema 2: Reglas de construcción (con su porqué)

**¿Por qué es importante?** Con las reglas dibujas a mano cómo se mueven los polos al cambiar la ganancia y eliges el \(K\) que cumple las especificaciones.

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
