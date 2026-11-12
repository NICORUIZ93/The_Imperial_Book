# Módulo 0: Cómo estudiar Control 1

Este curso va desde los números complejos hasta el diseño de compensadores. Cada fórmula viene con su demostración paso a paso, y cada tema con ejemplos resueltos que empiezan muy simples y llegan a nivel parcial. Está pensado para Control 1 de Ingeniería en la Universidad Distrital.

**Al terminar este módulo sabrás:**

- Cómo está armado cada capítulo y cómo estudiarlo.
- Qué capítulo cubre cada punto de los parciales.
- En qué orden estudiar en las próximas dos semanas.

## Aprende construyendo

### Tema 1: Cómo está armado cada capítulo

**¿Por qué es importante?** Si sabes cómo está armado cada capítulo, puedes estudiar los ejemplos en el orden correcto y no solo leer resultados.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Todos los capítulos siguen el mismo orden:

1. **Idea clave y teoría.** Primero la idea en palabras simples, después la fórmula.
2. **Procedimiento.** Los pasos exactos para resolver ese tipo de ejercicio.
3. **Demostración.** De dónde sale cada fórmula, paso a paso. Así no tienes que memorizar sin entender.
4. **Ejemplos resueltos.** Van de *Básico* a *Intermedio* y a *Nivel parcial*. Cada ejemplo dice qué cambia respecto al anterior, y cada paso dice qué se hace y **por qué**.
5. **Errores comunes y práctica.** Los errores típicos del tema y ejercicios con la respuesta plegada.

**Cómo estudiar un ejemplo:** lee el enunciado, tapa la solución e intenta el primer paso. Después abre la solución y compara solo ese paso, sobre todo el *¿Por qué?*. Repite paso por paso.

Los capítulos 10, 11, 20 y 21 (linealización, espacio de estados, compensadores y Bode) son de nivel experto: van más allá de lo que suele preguntarse en los primeros parciales, pero te preparan para Control 2.

Para verificar tus cuentas puedes usar Python con SymPy y SciPy. El proyecto de práctica de la ruta explica cómo preparar la carpeta `academia-labs/control-1`.

#### El temario

| Bloque | Capítulo | Tema | Qué aprendes |
|---|---|---|---|
| Bases matemáticas | 2 | Números complejos | Operar, forma polar, Euler, raíces de \(s^2+bs+c\) |
| | 3 | Transformada de Laplace | Tabla y propiedades demostradas, valor final |
| | 4 | Transformada inversa | Fracciones parciales en sus tres casos |
| | 5 | Ecuaciones diferenciales | De la ecuación a \(G(s)\) |
| Modelado | 6 | Sistemas de control | Elementos, lazo cerrado, perturbaciones |
| | 7 | Bloques y Mason | Reducción de diagramas complejos |
| | 8 | Circuitos y op-amps | Impedancias, RLC, controladores con op-amps |
| | 9 | Sistemas físicos | Mecánicos, motor DC, térmicos, tanques |
| | 10 | Linealización | Sistemas no lineales alrededor de un punto |
| | 11 | Espacio de estados | Matrices y su relación con \(G(s)\) |
| Respuesta en el tiempo | 12 | Primer orden y retardo | \(K\), \(\tau\), identificación |
| | 13 | Segundo orden | \(\zeta\), \(\omega_n\), \(M_p\), \(t_p\), \(t_s\) demostrados |
| | 14 | Polos dominantes y ceros | Sistemas de orden alto |
| | 15 | Error estacionario | Tipo de sistema, \(K_p\), \(K_v\), \(K_a\) |
| Estabilidad y diseño | 16 | Routh-Hurwitz | Estabilidad y rango de \(K\) |
| | 17 | Plano s y zona de diseño | Especificaciones como regiones |
| | 18 | Lugar de las raíces | Reglas y simulador |
| | 19 | Acciones P, I, D | Efectos y sintonía de Ziegler-Nichols |
| | 20 | Compensadores | Adelanto y atraso |
| | 21 | Bode | Respuesta en frecuencia y márgenes |
| Exámenes | 22 | Parciales resueltos | Parcial 1 y Parcial 2 paso a paso |
| | 23 | Simulacro y formulario | Un parcial nuevo con solución y todas las fórmulas |

#### Qué faltó en el Parcial 1

| Punto | Qué pedían | Qué faltó | Dónde se estudia |
|---|---|---|---|
| 1 | Ejemplo de sistema de control y sus elementos | Nombrar y definir cada elemento | Capítulo 6 |
| 2 | Función de transferencia del circuito con op-amps | Usar impedancias en Laplace en vez de derivadas en el tiempo | Capítulo 8 |
| 3 | Respuesta al impulso de dos \(G(s)\) | Tabla, retardo y completar el cuadrado | Capítulos 3, 4, 12 y 13 |
| 4 | Ventajas y desventajas de P, I, D | Explicar cada acción con su porqué | Capítulo 19 |

#### Plan de dos semanas

| Día | Qué estudiar |
|---|---|
| 1 | Capítulos 2 y 3 |
| 2 | Capítulos 4 y 5 |
| 3 | Capítulos 6 y 7 |
| 4 | Capítulo 8, luego los puntos 1 y 2 del Parcial 1 |
| 5 | Capítulo 9 |
| 6 | Capítulo 12, luego el punto 3 del Parcial 1 |
| 7 | Capítulo 13 (el más importante; con calma) |
| 8 | Capítulos 14 y 15 |
| 9 | Capítulos 16 y 17, luego el Parcial 2 completo |
| 10 | Capítulo 18 |
| 11 | Capítulo 19, luego el punto 4 del Parcial 1 |
| 12 | Simulacro en 90 minutos, solo con el formulario |
| 13–14 | Nivel experto: capítulos 10, 11, 20 y 21 |
