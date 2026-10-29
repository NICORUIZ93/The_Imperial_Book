def simular_rms(tareas, horizonte_ms):
    """Planificación por prioridad fija Rate Monotonic (menor periodo = mayor
    prioridad), con preempción real tick a tick (resolución 1 ms). Un deadline
    incumplido se detecta observando la ejecución -- no sumando utilización --:
    ocurre cuando llega una nueva instancia de una tarea y la anterior todavía
    tiene trabajo pendiente."""
    orden = sorted(tareas, key=lambda t: t[2])  # menor periodo primero
    restante = {nombre: 0 for nombre, _, _ in tareas}
    fallos = []
    for tick in range(horizonte_ms):
        for nombre, coste, periodo in tareas:
            if tick % periodo == 0:
                if restante[nombre] > 0:
                    fallos.append((tick, nombre, restante[nombre]))
                restante[nombre] = coste
        activa = next((nombre for nombre, _, _ in orden if restante[nombre] > 0), None)
        if activa:
            restante[activa] -= 1
    return fallos


tareas = [("sensor", 2, 20), ("publicar", 5, 100)]
fallos = simular_rms(tareas, horizonte_ms=200)
print(f"Deadlines incumplidos en 200 ms simulados: {len(fallos)}")
for tick, nombre, pendiente in fallos:
    print(f"  t={tick}ms tarea={nombre}: quedan {pendiente}ms de la instancia anterior")
