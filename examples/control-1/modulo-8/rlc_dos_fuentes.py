# rlc_dos_fuentes.py — nodo central de un circuito L-R-C con dos fuentes
from sympy import symbols, solve, simplify, factor

s, R, L, C = symbols("s R L C", positive=True)
V1, V2, VR = symbols("V1 V2 V_R")

# LCK en el nodo central: corriente de la bobina = corriente en R + corriente en C
ecuacion = (V1 - VR) / (s * L) - (VR / R + (VR - V2) * s * C)
VR_s = solve(ecuacion, VR)[0]

G1 = simplify(VR_s.diff(V1))   # V_R / V1
G2 = simplify(VR_s.diff(V2))   # V_R / V2
print("V_R/V1 =", factor(G1))
print("V_R/V2 =", factor(G2))
