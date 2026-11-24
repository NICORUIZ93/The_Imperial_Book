# regulador.py — regulador serie: op-amp no inversor + transistor de paso
from sympy import Rational, symbols, solve

Vo = symbols("Vo")
Vz, R1, R2, Vi = Rational(62, 10), 30_000, 10_000, 36

# El op-amp iguala sus entradas: la tensión del divisor vale lo mismo que la del zener
salida = solve(Vo * R2 / (R1 + R2) - Vz, Vo)[0]
print("Vo =", float(salida), "V")
print("Caída en Q1 =", float(Vi - salida), "V")
