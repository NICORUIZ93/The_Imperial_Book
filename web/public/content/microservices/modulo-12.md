# Módulo 8 · Resiliencia y tolerancia a fallos

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, Docker 29.9.3. Se verifican conceptos de circuit breaker, retry, rate limit, bulkhead, timeout, fallback y presupuesto de latencia con simulaciones. Resilience4j y Toxiproxy requieren dependencias/infra; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead, TimeLimiter · Avanzado · 240 min

Caso guía: proteger un servicio ante dependencia lenta o fallida.

#### Circuit Breaker

**Definición formal.** Patrón que abre el circuito tras fallos repetidos para evitar llamadas a una dependencia insalubre, permitiendo recuperación controlada.

**Para qué sirve.** Evita cascadas de fallos y libera recursos.

**Cuándo usarlo y cuándo no.** Úsalo en llamadas remotas con fallos transitorios. No lo uses para errores de validación de negocio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "let failures=0,open=false; function call(ok){ if(open) return 'OPEN'; failures=ok?0:failures+1; if(failures>=3){open=true; return 'OPEN'} return 'OK'; } console.log([false,false,false,true].map(call).join(','));"
```

**Caso de uso real.** Resilience4j abre circuito a servicio de pagos.

**Error común.** Umbrales mal calibrados. Síntoma: abre en picos normales o nunca abre. Corrección: métricas y tuning.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `OK,OK,OPEN,OPEN`.

#### Retry

**Definición formal.** Reintento controlado de una operación fallida, usualmente con backoff y límite.

**Para qué sirve.** Supera fallos transitorios.

**Cuándo usarlo y cuándo no.** Úsalo en errores transitorios idempotentes. No reintentes operaciones no idempotentes sin idempotency key.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "let n=0; function op(){n++; if(n<3) throw new Error('x'); return 'ok'}; let r; for(let i=0;i<5;i++){try{r=op();break;}catch(e){}} console.log(r,n)"
```

**Caso de uso real.** Retry con backoff exponencial en HTTP 503.

**Error común.** Retry storm. Corrección: backoff, jitter, límite máximo.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ok 3`.

#### RateLimiter y Bulkhead

**Definición formal.** Rate limiter limita tasa de llamadas; bulkhead aísla recursos (pool/hilos/semaforos) para que un fallo no agote todo.

**Para qué sirve.** Controlan carga y aíslan fallos.

**Cuándo usarlo y cuándo no.** Úsalo ante límites conocidos o recursos escasos. No pongas límites arbitrarios sin medir.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "let tokens=2; function allow(){ if(tokens>0){tokens--; return true;} return false;} console.log(allow(),allow(),allow());"
```

**Caso de uso real.** Bulkhead separa pool para servicio crítico.

**Error común.** Bulkhead demasiado pequeño. Síntoma: rechazos innecesarios. Corrección: dimensionar por carga.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true true false`.

#### TimeLimiter

**Definición formal.** Límite de tiempo máximo para una operación; si se excede, se cancela/falla.

**Para qué sirve.** Evita esperas indefinidas.

**Cuándo usarlo y cuándo no.** Siempre en llamadas remotas. Ajustar a SLO/presupuesto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "async function op(){ await new Promise(r=>setTimeout(r,50)); return 'ok'}; const t=Promise.race([op(), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),10))]); t.catch(e=>console.log(e.message));"
```

**Caso de uso real.** Timeout 500ms en dependencia.

**Error común.** Timeout mayor que timeout del cliente upstream. Corrección: presupuesto de latencia.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `timeout`.

### Tema 2: Timeouts en cascada y presupuesto de latencia · Avanzado · 120 min

Caso guía: cadena A->B->C con límites coherentes.

#### Presupuesto de latencia

**Definición formal.** Reparto del tiempo total permitido de una request entre dependencias downstream.

**Para qué sirve.** Evita cascadas y esperas inútiles.

**Cuándo usarlo y cuándo no.** Siempre en cadenas sync. No uses timeout igual en todos los niveles sin considerar acumulación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const total=500; const b=200; const c=150; console.log(b+c<=total)"
```

**Caso de uso real.** Gateway 500ms, servicio B 200ms, C 150ms.

**Error común.** Reintentos que exceden presupuesto. Corrección: incluir retries en budget.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`.

### Tema 3: Fallback strategies · Intermedio · 120 min

Caso guía: si recomendador falla, devolver catálogo básico.

#### Fallback

**Definición formal.** Respuesta alternativa cuando la operación principal falla o se degrada.

**Para qué sirve.** Mantiene funcionalidad parcial.

**Cuándo usarlo y cuándo no.** Úsalo cuando hay alternativa segura. No inventes datos críticos (pagos).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function rec(){ throw new Error('down') } function fallback(){ return ['popular1','popular2'] } let out; try{out=rec()}catch{out=fallback()} console.log(out.join(','))"
```

**Caso de uso real.** Mostrar contenido cacheado si personalización falla.

**Error común.** Fallback que oculta fallas sin métricas. Corrección: log/metricar activación.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `popular1,popular2`.

### Tema 4: Chaos Engineering con Toxiproxy · Avanzado · 120 min

Caso guía: inyectar latencia y validar resiliencia.

#### Chaos engineering

**Definición formal.** Práctica de experimentar fallos controlados para verificar resiliencia.

**Para qué sirve.** Encontrar debilidades antes de producción.

**Cuándo usarlo y cuándo no.** Úsalo con hipótesis, alcance y rollback. No en producción sin madurez.

**Ejemplo mínimo enfocado (ejecutable, inyección de fallo simulada).**

```bash
node -e "function call(latency){ if(latency>200) return 'timeout'; return 'ok'} console.log(call(50), call(300))"
```

**Caso de uso real.** Toxiproxy agrega latencia entre app y DB.

**Error común.** Experimentos sin hipótesis/abort conditions. Corrección: definir steady state, hipótesis y stop.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ok timeout`. **Nota:** Toxiproxy real requiere Docker/infra.

## Cierre del módulo

La resiliencia se diseña: timeouts, retries con backoff, circuit breakers, rate limits, bulkheads y fallbacks. El caos controlado valida que estas protecciones funcionan bajo fallos reales.
