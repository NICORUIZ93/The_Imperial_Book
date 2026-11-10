# Correo recuperable para RutaFlow

Laboratorio con Spring Boot 4.1.2, Java 25, Spring Mail, JDBC y H2. No requiere
Docker ni una cuenta SMTP para las pruebas.

```bash
./mvnw -q clean test
```

Las pruebas verifican que el adaptador construye `SimpleMailMessage` sin abrir
una conexión SMTP, que el envío y su correo pendiente se guardan en una sola
transacción, que un fallo transitorio se programa para reintento y que el tercer
fallo queda apartado con un código de error sin guardar el mensaje de excepción.

La configuración para un servidor de prueba usa `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD` y `MAIL_FROM`. Inyecta esos valores desde un
gestor de secretos; no uses credenciales reales en archivos versionados. La
aplicación de muestra no expone una ruta HTTP para enviar correo: los tests llaman
al dispatcher y sustituyen el gateway, así que no contactan ningún SMTP.

## Límites

H2 y el gateway simulado prueban el flujo de aplicación, no autenticación SMTP,
entrega a la bandeja ni clasificación de spam. Un timeout puede ocurrir después
de que el proveedor acepte el mensaje; SMTP no ofrece aquí una garantía general
de exactamente una entrega. El dispatcher de enseñanza es de una instancia:
antes de escalar, hace falta reclamar filas con concurrencia segura y probar la
política con la base de datos y proveedor reales. El cuerpo del correo se guarda
en el outbox didáctico; en producción aplica límites de retención y protección
de datos.
