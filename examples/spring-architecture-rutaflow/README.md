# Arquitectura RutaFlow · puertos y decisiones

JDK 25 y Node.js 20+. Desde esta carpeta:

```bash
javac -d out src/Hexagonal.java
java -cp out Hexagonal
node validar-c4.mjs
node validar-adr.mjs
```

El primer ejemplo ejecuta dominio y adaptador en memoria sin Spring. Los otros
dos comprueban forma documental, no calidad arquitectónica ni relaciones reales.
C4 y ADR son diseños propuestos explícitos; no se desplegaron api/worker/broker.
Revisa cada relación contra el código del proyecto integrador antes de adoptarla.
