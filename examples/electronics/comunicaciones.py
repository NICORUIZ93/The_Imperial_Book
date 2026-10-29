dato = 0b10110010
paridad = bin(dato).count("1") % 2
recibido = dato ^ 0b00000001
# Un cambio de un bit altera la paridad.
valido = bin(recibido).count("1") % 2 == paridad
print(f"Trama válida: {valido}")
