# Ejemplo transformado — Estándar editorial de la plataforma

> **Caso de transformación:** “Caching con Redis: @Cacheable, @CacheEvict, TTL” (Microservicios, Módulo 4, Lección 1).  
> **Alcance de esta entrega:** ejemplo completo con Capa 1 y Capa 2. La migración de todos los temas/cursos existentes es un trabajo editorial por lotes; este documento define el patrón que debe aplicarse.

---

## CAPA 1 — LECTURA

### 4.1 · ¿Cómo evitar que tu sistema consulte lo mismo una y otra vez?

#### ► DE QUÉ TRATA
Vas a entender qué es una caché, por qué Redis suele usarse como caché compartida y cómo se relacionan guardar, invalidar y dejar caducar un dato. El foco está en la decisión: cuándo la caché ayuda y cuándo te mete en problemas.

#### ► LA IDEA EN UNA FRASE
**Una caché guarda una copia temporal de una respuesta costosa para servirla rápido, pero obliga a decidir cuándo esa copia deja de ser válida.**

#### ► POR QUÉ EXISTE ESTO
Consultar una base de datos, otro servicio o un cálculo pesado tiene costo en tiempo y recursos. Cuando muchas peticiones piden el mismo dato, el sistema repite trabajo. La caché existe para evitar esa repetición. El precio es nuevo: ahora tienes dos lugares donde vive la información, y debes mantenerlos coherentes.

#### ► LA ANALOGÍA
Piensa en una biblioteca con un mostrador y un depósito en el sótano. La primera vez, el bibliotecario baja al depósito y tarda. Al volver, deja una copia en el mostrador con una etiqueta de caducidad. Quien pide el mismo libro después lo recibe al instante. Si llega una edición nueva, el bibliotecario retira la copia vieja del mostrador.  
**Dónde se rompe la analogía:** en software, muchas “sucursales” (instancias) pueden consultar el mismo mostrador compartido, y retirar una copia vieja puede fallar o llegar tarde si no diseñas bien la invalidación.

#### ► CÓMO FUNCIONA

```text
Cliente ──> ¿Está en caché? ──sí──> devuelve copia
                 │
                 no
                 │
                 ▼
           consulta origen
                 │
                 ▼
           guarda copia con TTL
                 │
                 ▼
           devuelve resultado
```

| Paso | Qué ocurre | Qué debes vigilar |
|---|---|---|
| 1. Buscar | El sistema revisa si existe una copia para esa clave. | La clave debe identificar bien el dato. |
| 2. Acierto/fallo | Si existe, responde rápido; si no, va al origen. | Un fallo no es error: es trabajo extra. |
| 3. Guardar | Tras el fallo, guarda la respuesta con tiempo de vida. | El TTL limita cuánto tiempo puede estar vieja. |
| 4. Invalidar | Cuando el dato cambia, la copia se borra o se actualiza. | Invalidar tarde crea datos obsoletos. |
| 5. Expirar | Si nadie la invalida, el TTL la elimina. | TTL corto = más frescura; TTL largo = más aciertos. |

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El usuario ve un precio viejo después de actualizarlo. | La copia no se invalidó al cambiar el dato. | Borra o actualiza la clave en la operación de escritura. |
| La base de datos recibe picos justo cuando expira un dato popular. | Muchas peticiones fallan en caché al mismo tiempo. | Usa protección contra estampida: bloqueo, recarga única o jitter en TTL. |
| La caché crece sin control. | No hay límite de memoria ni política de expulsión. | Define límite, política de expulsión y TTL razonables. |

#### ► TRADE-OFFS

| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Caché en memoria local | Datos pequeños, lectura muy frecuente, una sola instancia o tolerancia a diferencias entre instancias. | Cuando varias instancias deben ver el mismo valor actualizado. |
| Redis como caché compartida | Varias instancias, necesidad de compartir copias y TTL centralizado. | Cuando la consulta original ya es rápida y la red añade más complejidad que beneficio. |
| Sin caché | Datos que deben ser exactos en cada lectura o que casi no se repiten. | Cuando el mismo dato costoso se pide miles de veces. |

#### ► CUÁNDO NO USAR ESTO
No uses caché cuando el dato debe ser exacto en el momento de usarlo, como un saldo antes de cobrar. Tampoco la uses si el dato casi no se repite: pagarás latencia de red, invalidación y operación sin ganar casi aciertos. Mide primero; a veces el arreglo real es un índice o una consulta mejor.

#### ► DE VUELTA A LA ANALOGÍA
En la biblioteca, el mostrador ahorra viajes al sótano, pero solo funciona si la etiqueta de caducidad y el retiro de ediciones viejas se respetan. En tu sistema pasa igual: la velocidad de la copia solo vale si puedes confiar en su vigencia.

#### ► LO QUE DEBES RECORDAR
- Una caché es una **copia temporal**, no la fuente de verdad.
- Toda caché necesita una estrategia de **vigencia**: invalidación, TTL o ambas.
- Antes de agregar caché, mide el costo actual y el porcentaje esperado de aciertos.
- El error más caro no es un fallo de caché; es servir un dato viejo como si fuera actual.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué daño concreto ocurre en tu dominio si un usuario ve un dato con 30 segundos de antigüedad?
2. ¿Cómo sabrías que tu caché está ayudando y no solo ocultando un problema de consulta?
3. ¿En qué caso preferirías no cachear aunque la base de datos esté lenta?

---

## CAPA 2 — CONSTRUCCIÓN (colapsable)

> **Objetivo de construcción:** construir un servicio pequeño que consulte un producto lento, lo guarde en Redis, mida el acierto de caché, invalide al actualizar y verifique el TTL.  
> **Dominio del ejemplo:** catálogo de productos.  
> **No incluye:** comandos de infraestructura reales ni scripts completos dentro de la lectura; viven en el repositorio del laboratorio.

### Antes de empezar
- Vas a necesitar: Java, Spring Boot, Redis en ejecución y el proyecto del laboratorio.
- Resultado observable: la primera consulta tarda más que la segunda; al actualizar el precio, la siguiente lectura ve el valor nuevo.

### Paso 1 — Declara el dato que vas a cachear
**archivo `Producto.java` → define el objeto que viajará entre servicio y caché.**

```java
public record Producto(long id, String nombre, int precio) implements Serializable { }
```

Deberías notar: el dato es pequeño y tiene una identidad clara (`id`). Esa identidad será parte de la clave de caché.

### Paso 2 — Simula un origen lento
**archivo `RepositorioLento.java` → representa la consulta costosa que quieres evitar repetir.**

```java
public Producto buscar(long id) {
    consultas.incrementAndGet();
    dormir(200);
    return filas.get(id);
}
```

Deberías ver al ejecutar la prueba: el contador de consultas aumenta solo cuando el sistema va al origen.

### Paso 3 — Guarda la lectura en caché
**archivo `ProductoServicio.java` → indica que el resultado de buscar se puede reutilizar.**

```java
@Cacheable(cacheNames = "productos", key = "#id")
public Producto buscar(long id) {
    return repositorio.buscar(id);
}
```

Qué observar: la primera llamada consulta el origen; la segunda con el mismo `id` no debería incrementar el contador.

### Paso 4 — Invalida cuando el dato cambia
**archivo `ProductoServicio.java` → elimina la copia cuando el precio cambia.**

```java
@CacheEvict(cacheNames = "productos", key = "#id")
public void cambiarPrecio(long id, int precio) {
    Producto actual = repositorio.buscar(id);
    repositorio.guardar(new Producto(id, actual.nombre(), precio));
}
```

Qué observar: después de cambiar el precio, la próxima lectura debe ir al origen y devolver el valor nuevo.

### Paso 5 — Define un TTL distinto para otra caché
**archivo `CacheConfig.java` → configura caducidad corta para datos que cambian más rápido.**

```java
.withCacheConfiguration("ofertas",
    RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(2)));
```

Qué observar: la entrada de “ofertas” expira sola tras el tiempo configurado.

### Paso 6 — Verifica el comportamiento
**archivo `verify.sh` o prueba automatizada → confirma acierto, invalidación y expiración.**

Ejecuta la verificación del laboratorio para confirmar:
- segunda lectura sin consulta al origen;
- clave creada con TTL;
- invalidación tras escritura;
- recarga tras expiración.

Output esperado (resumen):
```text
Pruebas de caché: OK
RESULTADO: OK
```

### Código de referencia
El código completo y ejecutable vive en el laboratorio del módulo. Úsalo para comparar, no para copiar antes de intentar el paso a paso.

### Verificación automática
La verificación se ejecuta con el script de pruebas del laboratorio del repositorio. La Capa 1 no repite comandos ni rutas internas; la fuente ejecutable es el lab.

### Errores comunes en construcción
- **Anotar y no ver efecto:** la llamada ocurre dentro de la misma clase y no pasa por el proxy.
- **Objeto no serializable:** la caché falla al guardar el valor.
- **Invalidación ausente:** el sistema responde rápido, pero con datos viejos.
