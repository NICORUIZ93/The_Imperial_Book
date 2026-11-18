# 007 · Mejoras del informe de capturas del 2026-11-18

**Estado:** vigente
**Origen:** pedido del 2026-11-18: revisar de nuevo las imágenes guardadas, eliminar las repetidas,
leerlas y «aplicar todas las mejoras» del informe resultante.

## Contexto y límites

- En `~/Downloads` había 21 capturas; 13 eran copias idénticas (mismo SHA-1) y se borraron. Quedan 8.
- Las decisiones por captura viven en `docs/capture-intake.json`. Esta spec corrige ese registro y agrega
  solo lo que el informe dejó como hueco.
- Los temas nuevos siguen specs/002 (diagrama, código con nombre de archivo, explicación por bloques,
  resultado esperado y captura real) y entran en `specs/visual-aids-scope.json`.
- Kiri (Midudev) se cita como proyecto nuevo, no como recomendación: GitHub muestra 5 estrellas y 1 fork,
  sin versión estable publicada.
- «Spring Boot Harness» (DevTalles) sigue sin temario público el 2026-11-18; no se inventa un hueco.

## Criterios

- **C1** `pendiente` — La ruta de Java (módulo 0, paso 05) y el registro llevan «Multihilo» a los temas que
  enseñan hilos: java/5 Tema 1 (ExecutorService), Tema 3 (virtual threads) y Tema 4 (sincronización).
  Verificación: `python3 -c "import json;d=json.load(open('docs/capture-intake.json'));w=[x for b in d['batches'] for c in b['captures'] for t in c.get('topics',[]) if t['title']=='Multihilo' for x in t['where']];assert {(x['track'],x['module'],x['topic']) for x in w}=={('java',5,1),('java',5,3),('java',5,4)},w" && grep -q "/curso/java/5#tema-1-executorservice" web/public/content/java/modulo-0.md`
- **C2** `pendiente` — Las 8 capturas únicas están registradas en `docs/capture-intake.json` con una
  decisión por tema, y el registro valida.
  Verificación: `python3 scripts/validate_capture_intake.py && python3 -c "import json;d=json.load(open('docs/capture-intake.json'));f={c['file'] for b in d['batches'] for c in b['captures']};assert {'1135CCFD-7562-4F64-A7F6-A75C09479DC4.PNG','92A44112-DB6A-4B92-9C68-6FDBF6752F3F.PNG','5380F6D6-8DE7-423A-A761-C91576722AE5.PNG'}<=f"`
- **C3** `pendiente` — DevOps módulo 2 tiene un tema para elegir el motor de contenedores local
  (Docker Desktop, Podman, Colima, Rancher Desktop y Kiri como proyecto nuevo), con captura real.
  Verificación: `grep -q "^### Tema 9: Elegir el motor de contenedores local" web/public/content/devops/modulo-2.md && python3 scripts/audit_visual_aids.py`
- **C4** `pendiente` — Fundamentos módulo 7 tiene un tema para evaluar una skill de agente antes de usarla,
  con los tres niveles de SkillEvaluator (validar, deduplicar, medir con A/B) y captura real.
  Verificación: `grep -q "^### Tema 7: Evaluar una skill de agente antes de usarla" web/public/content/foundations/modulo-7.md && python3 scripts/audit_visual_aids.py`
- **C5** `pendiente` — Cloud módulo 33 Tema 2 compara EKS, AKS y GKE (tarifa del plano de control, red de
  pods e identidad de pods) con fuentes oficiales.
  Verificación: `python3 -c "import re;t=open('web/public/content/cloud/modulo-33.md').read();b=t.split('### Tema 2:')[1].split('### Tema 3:')[0];assert all(k in b for k in ('| EKS |','| AKS |','| GKE |','Workload Identity'))"`
- **C6** `pendiente` — Cada ruta abre su módulo 0 con un mapa de la ruta: un diagrama de etapas y una tabla
  con enlace a cada módulo, generados desde `web/src/app/tracks/*.track.ts` por
  `scripts/build_route_maps.py`.
  Verificación: `python3 scripts/build_route_maps.py --check`
- **C7** `pendiente` — «Spring Boot Harness» queda registrado con la fecha de la última búsqueda de temario
  y la fecha de la próxima revisión.
  Verificación: `python3 -c "import json;d=json.load(open('docs/capture-intake.json'));t=[t for b in d['batches'] for c in b['captures'] for t in c.get('topics',[]) if t['title'].startswith('Spring Boot Harness')][0];assert t.get('reviewAgainOn')"`
