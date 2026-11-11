# Módulo 23: Spring Modulith: límites, eventos y pruebas modulares

## Aprende construyendo

Aplica las fronteras del módulo 22 a otro dominio de laboratorio, Pedidos y Notificaciones, con Spring Boot 4.1.2 y Spring Modulith 2.1.1, fijados en el POM del laboratorio. Trabajarás sobre `pedidos` y `notificaciones` reales, en lugar de imaginar paquetes vacíos. El registro JDBC usa H2 durante las pruebas. Un módulo es una frontera lógica dentro del proceso; no equivale a un microservicio.

### Tema 1: módulos y límites entre paquetes

**Meta:** detectar una dependencia de un módulo hacia una clase interna de otro.

**¿Por qué es importante?** Separar carpetas no impide acoplamiento; una verificación repetible hace visible la dependencia prohibida.

**Prerrequisitos:** M22 T1, paquetes Java, imports y JUnit. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-modulith-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-modulith-rutaflow practica-m23-t1
cd practica-m23-t1
./mvnw -q test
```

**Analogía:** los módulos son habitaciones con puertas públicas; un import a internals atraviesa una pared. Esa comparación no decide por sí sola qué API es conveniente.

#### Subtema 23.1.1 · Reconoce la frontera verificable · 10 min

**Contexto:** Los paquetes inmediatos de la aplicación definen capacidades de negocio.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/modulith/RutaFlowModulithApplication.java` y `src/test/java/academia/rutaflow/modulith/ArquitecturaModularTest.java`. Sigue ApplicationModules.of y verify.

```bash
./mvnw -q -Dtest=ArquitecturaModularTest test
```

**Resultado esperado:** La prueba no encuentra ciclos ni accesos a internals en el laboratorio actual.

**Fallo deliberado:** En NotificacionListener.java, añade un campo con tipo academia.rutaflow.modulith.pedidos.internal.PedidoInterno.

**Diagnóstico:** Java permite el tipo público, pero Modulith detecta que otro módulo accede al paquete interno; elimina el campo.

**Entiende:** verify comprueba relaciones estáticas del modelo modular. No verifica autorización, transacciones distribuidas ni corrección de negocio.

**Cierra:** Guarda la dependencia rechazada y el resultado correcto tras retirarla.

#### Subtema 23.1.2 · Publica contratos pequeños · 10 min

**Contexto:** Notificaciones necesita saber que un pedido se creó, sin leer su dirección privada.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/modulith/pedidos/PedidoCreado.java` y compáralo con `pedidos/internal/PedidoInterno.java`. El evento solo contiene pedidoId.

```bash
./mvnw -q -Dtest=ArquitecturaModularTest,PedidosModuleTest test
```

**Resultado esperado:** El evento público se puede referenciar y el módulo Pedidos publica RF-205.

**Fallo deliberado:** Importa PedidoInterno desde el listener para extraer direccionPrivada.

**Diagnóstico:** la prueba de frontera rechaza el acoplamiento aunque el código compile; vuelve a usar PedidoCreado.

**Entiende:** Un contrato de evento debe contener lo que el consumidor necesita y permitir evolución. Público en Java no significa API pública del módulo.

**Cierra:** Anota qué dato privado quedó fuera y por qué no es necesario para el aviso.

#### Subtema 23.1.3 · Comprueba antes de mover paquetes · 10 min

**Contexto:** Cambiar el paquete de una clase puede cambiar su visibilidad modular.

**Hazlo tú:** En `src/test/java/academia/rutaflow/modulith/ArquitecturaModularTest.java`, lee qué clase raíz delimita el análisis. Ejecuta desde la carpeta copiada.

```bash
./mvnw -q test
```

**Resultado esperado:** Arquitectura y pruebas de eventos pasan con la estructura actual.

**Fallo deliberado:** Mueve PedidoCreado al paquete internal y cambia el import del listener para que compile.

**Diagnóstico:** el consumidor ya depende de un interno; verify falla. Restaura el paquete público original.

**Entiende:** Una refactorización de paquetes puede alterar el contrato aunque el IDE actualice imports. Comprueba arquitectura y consumidores juntos.

**Cierra:** Guarda los paquetes públicos y los internos en una nota de tu proyecto.

**Práctica independiente:** En una copia añade un módulo facturacion que use solo PedidoCreado. Escribe un test de frontera y luego un acceso interno deliberado; conserva el contraste. No lo presentes como servicio desplegado.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring Modulith: fundamentos](https://docs.spring.io/spring-modulith/reference/fundamentals.html)

### Tema 2: eventos entre módulos sin importar implementación

**Meta:** publicar un hecho de negocio y observar su reacción local después del commit.

**¿Por qué es importante?** Invocar directamente internals de otro módulo oculta el contrato y acopla cambios.

**Prerrequisitos:** M20 T2 y M23 T1. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-modulith-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-modulith-rutaflow practica-m23-t2
cd practica-m23-t2
./mvnw -q test
```

**Analogía:** el evento es un aviso acordado entre oficinas; publicar el aviso no equivale a confirmar su recepción durable.

#### Subtema 23.2.1 · Publica desde el servicio · 10 min

**Contexto:** PedidosService declara una operación transaccional que publica PedidoCreado.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/modulith/pedidos/PedidosService.java` y `src/test/java/academia/rutaflow/modulith/pedidos/PedidosModuleTest.java`. Sigue crear hasta publishEvent.

```bash
./mvnw -q -Dtest=PedidosModuleTest test
```

**Resultado esperado:** PublishedEvents contiene un PedidoCreado con RF-205.

**Fallo deliberado:** Quita events.publishEvent de crear.

**Diagnóstico:** el conjunto de eventos observado queda vacío y falla la cantidad esperada; restaura publicación.

**Entiende:** PublishedEvents observa eventos del contexto de test; no demuestra que Kafka, RabbitMQ o una app móvil recibieran datos.

**Cierra:** Conserva ID y cantidad del evento observado.

#### Subtema 23.2.2 · Reacciona mediante el contrato · 10 min

**Contexto:** El listener consume PedidoCreado y actualiza la bandeja local.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/modulith/notificaciones/NotificacionListener.java` y `src/test/java/academia/rutaflow/modulith/notificaciones/NotificacionesModuleTest.java`. Sigue ApplicationModuleListener hasta agregar.

```bash
./mvnw -q -Dtest=NotificacionesModuleTest test
```

**Resultado esperado:** La bandeja llega a contener Pedido recibido: RF-204 antes del timeout de prueba.

**Fallo deliberado:** Omite bandeja.agregar en el listener.

**Diagnóstico:** la espera termina sin el aviso esperado; restaura la llamada. El timeout del test evita una espera infinita, no define un SLA.

**Entiende:** ApplicationModuleListener combina manejo transaccional y asíncrono. El registro de publicaciones ayuda a gestionar pendientes; no convierte un efecto externo en transacción distribuida.

**Cierra:** Guarda el aviso y explica la diferencia entre publicar y consumir.

#### Subtema 23.2.3 · Separa registro y efecto durable · 10 min

**Contexto:** El laboratorio registra publicaciones con JDBC en H2, pero la bandeja y la base de test son locales.

**Hazlo tú:** Abre `src/test/resources/application.yml` y `src/main/java/academia/rutaflow/modulith/notificaciones/BandejaNotificaciones.java`. Identifica qué se perdería al reiniciar.

```bash
./mvnw -q -Dtest=NotificacionesModuleTest test
```

**Resultado esperado:** La reacción local pasa; no se produce una prueba de reinicio ni de recuperación entre procesos.

**Fallo deliberado:** Escribe en tu evidencia que este test prueba un broker externo.

**Diagnóstico:** no existe conexión a broker en el test ni configuración de ese transporte; corrige la afirmación y distingue H2 de un almacén persistente externo.

**Entiende:** Para probar recuperación debes conservar una base relacional real, provocar publicación pendiente, reiniciar y observar reintento con idempotencia del efecto. Esa prueba no está implementada aquí.

**Cierra:** Enumera lo demostrado y el experimento que aún necesita infraestructura persistente.

**Práctica independiente:** Añade un segundo evento autorizado y un listener de prueba. Comprueba que el aviso aparece una vez en el caso normal; estudia por separado replay y deduplicación antes de prometer exactamente una vez.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring Modulith: eventos](https://docs.spring.io/spring-modulith/reference/events.html)

### Tema 3: documentación generada y mapa de dependencias

**Meta:** generar PlantUML y fichas Asciidoc desde el modelo modular y contrastar una relación con un import.

**¿Por qué es importante?** Una documentación manual puede divergir del código; la generación reduce ese desfase sin validar todas las decisiones.

**Prerrequisitos:** M22 T2 y M23 T1. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-modulith-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-modulith-rutaflow practica-m23-t3
cd practica-m23-t3
./mvnw -q test
```

**Analogía:** el mapa generado es una fotografía de los paquetes analizados, no del despliegue completo ni de su tráfico.

#### Subtema 23.3.1 · Genera documentos reproducibles · 10 min

**Contexto:** Documenter usa el mismo ApplicationModules que analiza las fronteras.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/modulith/DocumentacionModularTest.java`. Sigue new Documenter(modules).writeDocumentation().

```bash
./mvnw -q -Dtest=DocumentacionModularTest test
```

**Resultado esperado:** target/spring-modulith-docs contiene archivos .puml y .adoc; el test comprueba que existen ambos formatos.

**Fallo deliberado:** Comenta writeDocumentation, elimina solo target/spring-modulith-docs y repite.

**Diagnóstico:** faltan los archivos generados; la prueba falla. Restaura la generación; conservar salidas anteriores habría ocultado este fallo.

**Entiende:** Crear PlantUML no equivale a renderizar PNG ni publicar una página. El test verifica archivos, no legibilidad de una imagen.

**Cierra:** Guarda nombres y fecha de generación y señala que no se renderizó una imagen aquí.

#### Subtema 23.3.2 · Contrasta una relación con código · 10 min

**Contexto:** Notificaciones depende del contrato de Pedidos para interpretar PedidoCreado.

**Hazlo tú:** Abre un .puml bajo `target/spring-modulith-docs` y contrasta la dependencia con el import de `src/main/java/academia/rutaflow/modulith/notificaciones/NotificacionListener.java`.

```bash
./mvnw -q -Dtest=ArquitecturaModularTest,DocumentacionModularTest test
```

**Resultado esperado:** La relación del mapa tiene un import rastreable y la verificación modular sigue pasando.

**Fallo deliberado:** Dibuja manualmente una dependencia Pedidos hacia Notificaciones sin cambiar el código.

**Diagnóstico:** el mapa editado ya no es una salida fiel de Documenter; regenera y contrasta los archivos en lugar de tratar la edición como evidencia.

**Entiende:** El diagrama describe módulos y relaciones estáticas; no demuestra dónde corre cada módulo ni si una llamada ocurrió durante un incidente.

**Cierra:** Escribe archivo origen, símbolo importado y relación que lo representa.

#### Subtema 23.3.3 · Versiona la explicación junto al mapa · 10 min

**Contexto:** Un artefacto de build puede regenerarse; las decisiones y límites también deben conservarse.

**Hazlo tú:** Crea `docs/mapa-modular.md` en la copia y enlaza generación, módulos, import respaldado y límites. Revisa `README.md` del laboratorio.

```bash
./mvnw -q -Dtest=DocumentacionModularTest test
```

**Resultado esperado:** La guía indica cómo reconstruir el mapa y no promete descubrir infraestructura externa.

**Fallo deliberado:** Afirma que el mapa prueba recuperación del broker Kafka.

**Diagnóstico:** el modelo inspecciona paquetes Java y aquí no analiza ningún despliegue Kafka; elimina esa conclusión.

**Entiende:** Acompaña documentación generada con contexto de operación y ADR. Un enlace a un archivo temporal de target puede romperse si no se publica el artefacto.

**Cierra:** Conserva comando, relación respaldada y ubicación donde publicarías el resultado.

**Práctica independiente:** Agrega un módulo nuevo a la copia, genera de nuevo y compara dependencias y canvas. Documenta una relación esperada y comprueba su import; no añadas flechas para mejorar apariencia.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring Modulith: Documenter](https://docs.spring.io/spring-modulith/reference/documentation.html)

### Tema 4: pruebas de integración por módulo

**Meta:** distinguir un test modular acotado del contexto completo y localizar qué evidencia produce cada uno.

**¿Por qué es importante?** Ampliar todo test a la aplicación completa puede esconder dependencias que deberían ser explícitas.

**Prerrequisitos:** M6 y M23 T1–T3. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-modulith-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-modulith-rutaflow practica-m23-t4
cd practica-m23-t4
./mvnw -q test
```

**Analogía:** un ensayo de una oficina comprueba su trabajo; un ensayo conjunto comprueba el intercambio entre oficinas. Ninguno ensaya automáticamente toda la red.

#### Subtema 23.4.1 · Ejecuta solo Pedidos · 10 min

**Contexto:** ApplicationModuleTest limita el contexto al módulo donde vive la prueba.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/modulith/pedidos/PedidosModuleTest.java` y ubica su paquete y anotación.

```bash
./mvnw -q -Dtest=PedidosModuleTest test
```

**Resultado esperado:** Pedidos publica un evento sin necesitar cargar la bandeja de Notificaciones como colaborador del servicio.

**Fallo deliberado:** Inyecta BandejaNotificaciones en el test modular sin ampliar el alcance.

**Diagnóstico:** el contexto acotado no ofrece ese bean de otro módulo; restaura el test y explica la dependencia que intentaste introducir.

**Entiende:** El aislamiento modular ayuda a detectar acoplamiento. Un mock externo puede satisfacer una dependencia explícita, pero entonces no prueba su implementación real.

**Cierra:** Guarda anotación, módulo cargado y colaboración que no participó.

#### Subtema 23.4.2 · Contrasta con el test del flujo · 10 min

**Contexto:** NotificacionesModuleTest usa SpringBootTest para observar la reacción entre dos módulos reales.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/modulith/notificaciones/NotificacionesModuleTest.java` y compáralo con el test anterior.

```bash
./mvnw -q -Dtest=PedidosModuleTest,NotificacionesModuleTest test
```

**Resultado esperado:** Ambos pasan, con evidencias distintas: publicación en un módulo y aviso en un contexto más amplio.

**Fallo deliberado:** Sustituye SpringBootTest por ApplicationModuleTest en el test de Notificaciones manteniendo la inyección de PedidosService.

**Diagnóstico:** el alcance cambia y el bean externo puede faltar; no amplíes silenciosamente el test para ocultar ese cambio. Restaura la configuración inicial.

**Entiende:** Spring Modulith ofrece Scenario para expresar estímulo y espera en otros escenarios. Este laboratorio usa PublishedEvents y Awaitility; no declara ejecutada una prueba Scenario que no existe.

**Cierra:** Escribe por qué este flujo exige ambos módulos y qué transporte sigue fuera.

#### Subtema 23.4.3 · Cierra la matriz de alcance · 10 min

**Contexto:** La suite junta frontera, publicación, reacción y generación documental.

**Hazlo tú:** Abre `pom.xml` y los cuatro tests bajo `src/test/java/academia/rutaflow/modulith/`. Ejecuta una suite limpia.

```bash
./mvnw -q clean test
```

**Resultado esperado:** Cuatro pruebas correctas, incluida DocumentacionModularTest; el registro JDBC usa H2 de test.

**Fallo deliberado:** Quita la publicación del evento y ejecuta la suite.

**Diagnóstico:** las pruebas de publicación/reacción fallan aunque la frontera estática pueda seguir válida; restaura y repite.

**Entiende:** Una prueba de arquitectura y una de comportamiento responden preguntas distintas. Ninguna mide todavía recuperación tras caída de proceso o autorización de usuario.

**Cierra:** Conserva conteos, pruebas seleccionadas y límites sin presentar cuatro tests como todas las garantías del sistema.

**Práctica independiente:** Escribe una prueba modular de una regla nueva y otra del flujo entre módulos. Declara en cada una qué dependencia es real, cuál simulada y si existe transporte externo.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring Modulith: pruebas modulares](https://docs.spring.io/spring-modulith/reference/testing.html)

