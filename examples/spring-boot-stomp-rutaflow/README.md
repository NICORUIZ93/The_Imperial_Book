# Spring Boot STOMP: posiciones RutaFlow

Laboratorio independiente con Java 25 y Spring Boot 4.1.2. Levanta un servidor
WebSocket/STOMP embebido, conecta un `WebSocketStompClient` real y entrega un
evento JSON a quien se suscribió al destino correcto.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

El test abre un puerto aleatorio local. Primero suscribe el cliente al topic de
entregas y a una señal de preparación; solo publica cuando recibe esa señal.
Después verifica el evento y que repetir su secuencia no vuelva a publicarlo.
Esto evita usar `Thread.sleep` para adivinar cuándo terminó una suscripción.

## Qué enseña y qué no

- `/ws-entregas` abre la conexión, `/app` dirige mensajes a controladores y
  `/topic` enruta publicaciones a los suscriptores.
- `PositionPublisher` construye `/topic/entregas/{shipmentId}` y pasa por un
  control de secuencia antes de publicar.
- El broker simple y el mapa de secuencias viven en memoria de un proceso. El
  mapa no coordina varias instancias ni sobrevive a un reinicio. Para escalar,
  persistir deduplicación o usar confirmaciones STOMP, evalúa un broker externo
  con relay y almacenamiento apropiado.
- La autorización de quién puede suscribirse o enviar un ID no está configurada
  aquí. Añade autenticación y autorización por envío antes de exponer destinos
  con datos privados.
- STOMP sobre WebSocket no es Socket.IO. Un cliente Socket.IO necesita el
  servidor compatible o gateway que corresponda.
