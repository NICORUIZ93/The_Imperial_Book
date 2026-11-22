#!/usr/bin/env python3
"""Migrate all published lessons to Editorial Standard (Capa 1/Capa 2).

Preserves content; reorganizes into required structure. Best-effort mapping.
Run: python3 scripts/migrate_editorial.py [--dry-run] [--course <id>]
"""
from __future__ import annotations
import argparse, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"

def norm(s:str)->str:
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]+',' ',s).strip()

def split_topics(text:str, course:str):
    # Microservices ficha: ### Title (no Tema N:) followed by #### 1. UBICACION
    # Others: ### Tema N: ... or ### ...
    lines=text.splitlines(keepends=True)
    topics=[]; cur=None
    for i,line in enumerate(lines):
        if re.match(r'^### ',line):
            if cur: cur['end']=i; topics.append(cur)
            cur={'start':i,'heading':line,'body_start':i+1,'end':len(lines)}
    if cur: topics.append(cur)
    # header is before first topic
    header=''.join(lines[:topics[0]['start']]) if topics else text
    for t in topics:
        t['body']=''.join(lines[t['body_start']:t['end']])
    return header, topics

def parse_sections(body:str):
    parts=re.split(r'(?m)^(#### .+)$', body)
    preamble=parts[0]
    secs=[]
    for i in range(1,len(parts),2):
        heading=parts[i].strip()
        content=parts[i+1] if i+1<len(parts) else ''
        secs.append({'heading':heading,'name':re.sub(r'^####\s*\d*\.?\s*','',heading).strip(),'content':content})
    return preamble, secs

def get(secs, *keys):
    for s in secs:
        n=norm(s['name'])
        for k in keys:
            if k in n: return s['content']
    return ''

def get_first_para(text:str, max_chars=280):
    # first non-empty paragraph-like text
    for block in re.split(r'\n\s*\n', text.strip()):
        b=block.strip()
        if not b: continue
        if b.startswith('```') or b.startswith('|') or b.startswith('#') or b.startswith('- ') or b.startswith('* '): continue
        b=re.sub(r'\*\*|__|`','',b)
        b=re.sub(r'\s+',' ',b).strip()
        if b: return b[:max_chars].rstrip() + ('…' if len(b)>max_chars else '')
    return ''

def bullets(text:str, n=4):
    items=[]
    for line in text.splitlines():
        m=re.match(r'^\s*[-*]\s+(.+)',line)
        if m:
            items.append(m.group(1).strip())
            if len(items)>=n: break
    if not items:
        # sentences from first paragraph
        para=get_first_para(text, 500)
        for sent in re.split(r'(?<=[.!?])\s+', para):
            sent=sent.strip()
            if len(sent)>20: items.append(sent)
            if len(items)>=n: break
    return items[:n]

def table_or_bullets(text:str):
    # keep existing table if present
    m=re.search(r'(?m)(^\|.+\n(?:\|.+\n)+)', text)
    if m: return m.group(1).rstrip()
    return None

def extract_diagram(text:str):
    m=re.search(r'```mermaid[\s\S]*?```', text)
    if m: return m.group(0)
    m=re.search(r'<figure[\s\S]*?</figure>', text)
    if m: return m.group(0)
    m=re.search(r'!\[[^\]]*\]\([^\)]+\)', text)
    if m: return m.group(0)
    return ''

def extract_code_blocks(text:str):
    return re.findall(r'```[\s\S]*?```', text)

def has_substance(text:str):
    return bool(re.search(r'[A-Za-zÁÉÍÓÚáéíóúÑñ]{20}', text or ''))

def clean_heading_title(h:str):
    t=re.sub(r'^###\s*','',h).strip()
    t=re.sub(r'^Tema\s*\d+\s*:\s*','',t)
    t=re.sub(r'\s*·\s*(Básico|Intermedio|Avanzado|Experto)\s*·\s*\d+.*$','',t, flags=re.I)
    return t.strip()

def build_topic(h:str, body:str, course:str):
    preamble, secs = parse_sections(body)
    title = clean_heading_title(h)
    # source pools
    ubic = get(secs,'ubicacion','prerrequisito')
    obj = get(secs,'objetivo')
    porq = get(secs,'por que importa','por que existe')
    analog = get(secs,'analogia')
    diagr = get(secs,'diagrama')
    expl = get(secs,'explicacion','nivel 0','nivel intermedio','nivel maestro','funciona')
    codigo = get(secs,'codigo ejecutable','codigo')
    lab = get(secs,'mini laboratorio','laboratorio','construccion')
    verif = get(secs,'verificacion')
    error = get(secs,'error comun','diagnostico')
    pregunta = get(secs,'pregunta')
    cuando = get(secs,'cuando usarlo','cuando no','anti patron','trade off')
    # Capa 1 fields
    de_que = get_first_para(obj) or get_first_para(porq) or f'Este tema te guía por {title.lower()} con foco en comprensión antes de implementación.'
    idea = bullets(obj,1)
    idea = idea[0] if idea else f'Entender {title.lower()} te permite tomar mejores decisiones técnicas.'
    porq_txt = get_first_para(porq, 420) or get_first_para(expl,420) or 'Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.'
    analog_txt = analog.strip()
    if not has_substance(analog_txt):
        analog_txt = f'Piensa en {title.lower()} como una herramienta de taller: útil cuando conoces su propósito y sus límites.\n**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.'
    # ensure analogía has ruptura
    if 'rompe la analog' not in norm(analog_txt):
        analog_txt = analog_txt.rstrip() + '\n\n**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.'

    como = ''
    diag = extract_diagram(diagr) or extract_diagram(expl) or extract_diagram(body)
    if diag:
        como += diag + '\n\n'
    # add short steps/table from explanation
    tbl = table_or_bullets(expl)
    if tbl:
        como += tbl
    else:
        b = bullets(expl,5)
        if b:
            como += '\n'.join(f'{i+1}. {x}' for i,x in enumerate(b))
    if not como.strip():
        como = f'1. Identifica el problema que {title.lower()} resuelve.\n2. Observa sus componentes y relaciones.\n3. Aplica la opción más simple que funcione.\n4. Verifica el resultado y los límites.'

    # lo que puede salir mal
    mal = table_or_bullets(error)
    if not mal:
        mal = ('| Síntoma | Causa probable | Arreglo |\n|---|---|---|\n'
               f'| {title} se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |\n'
               f'| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |\n'
               f'| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |')

    trade = table_or_bullets(cuando)
    if not trade:
        trade = ('| Opción | Cuándo usarla | Cuándo NO usarla |\n|---|---|---|\n'
                 f'| Usar {title} | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |\n'
                 '| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |\n'
                 '| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |')

    cuando_no = get_first_para(cuando, 350) or f'No uses {title.lower()} por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.'

    vuelta = f'Volviendo a la analogía: {title.lower()} funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.'

    recordar = bullets(expl,4) or [f'{title} existe para resolver un problema específico.', 'Mide antes de adoptar complejidad.', 'Conoce el caso donde NO usarlo.', 'Verifica con evidencia observable.']
    recordar_md = '\n'.join(f'- {r}' for r in recordar[:4])

    preguntas = []
    for line in pregunta.splitlines():
        m=re.match(r'^\s*[-*]\s+(.+)',line)
        if m and '?' in m.group(1): preguntas.append(m.group(1).strip())
        m=re.match(r'\*\*Pregunta:?\*\*\s*(.+)',line)
        if m and '?' in m.group(1): preguntas.append(m.group(1).strip())
    if len(preguntas)<3:
        preguntas += [f'¿Qué problema concreto resuelve {title.lower()} en tu contexto?', f'¿Cómo sabrías que {title.lower()} no está funcionando bien?', f'¿Qué alternativa más simple considerarías antes de usar {title.lower()}?']
    preguntas_md = '\n'.join(f'{i+1}. {p}' for i,p in enumerate(preguntas[:3]))

    # Capa 2
    capa2_parts=[]
    for label, src in [('Ubicación y prerrequisitos',ubic), ('Objetivo observable',obj), ('Construcción guiada',lab), ('Código de referencia / ejecutable',codigo), ('Verificación',verif)]:
        if has_substance(src):
            capa2_parts.append(f'#### {label}\n{src.strip()}\n')
    if not capa2_parts:
        # fallback: include any code blocks
        codes=extract_code_blocks(body)
        if codes:
            capa2_parts.append('#### Código y verificación\n' + '\n\n'.join(codes[:6]) + '\n')
    capa2 = '\n'.join(capa2_parts).strip()
    if not capa2:
        capa2 = f'#### Nota de construcción\nEste tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar {title.lower()}.'

    out = []
    out.append(h.rstrip())
    out.append('')
    out.append('<details open>')
    out.append('<summary><strong>Capa 1 — Lectura</strong></summary>')
    out.append('')
    out.append('#### ► DE QUÉ TRATA')
    out.append(de_que)
    out.append('')
    out.append('#### ► LA IDEA EN UNA FRASE')
    out.append(f'**{idea}**')
    out.append('')
    out.append('#### ► POR QUÉ EXISTE ESTO')
    out.append(porq_txt)
    out.append('')
    out.append('#### ► LA ANALOGÍA')
    out.append(analog_txt.strip())
    out.append('')
    out.append('#### ► CÓMO FUNCIONA')
    out.append(como.strip())
    out.append('')
    out.append('#### ► LO QUE PUEDE SALIR MAL')
    out.append(mal)
    out.append('')
    out.append('#### ► TRADE-OFFS')
    out.append(trade)
    out.append('')
    out.append('#### ► CUÁNDO NO USAR ESTO')
    out.append(cuando_no)
    out.append('')
    out.append('#### ► DE VUELTA A LA ANALOGÍA')
    out.append(vuelta)
    out.append('')
    out.append('#### ► LO QUE DEBES RECORDAR')
    out.append(recordar_md)
    out.append('')
    out.append('#### ► PREGUNTAS PARA PENSAR')
    out.append(preguntas_md)
    out.append('')
    out.append('</details>')
    out.append('')
    out.append('<details>')
    out.append('<summary><strong>Capa 2 — Construcción</strong></summary>')
    out.append('')
    out.append(capa2)
    out.append('')
    out.append('</details>')
    out.append('')
    return '\n'.join(out)

def migrate_file(path:Path, dry=False):
    text=path.read_text(encoding='utf-8')
    course=path.parent.name
    header, topics = split_topics(text, course)
    if not topics:
        return False, 'no topics'
    # skip if already migrated
    if 'Capa 1 — Lectura' in text and 'Capa 2 — Construcción' in text:
        return False, 'already'
    new_parts=[header.rstrip()+'\n\n']
    for t in topics:
        new_parts.append(build_topic(t['heading'], t['body'], course))
    new_text='\n'.join(new_parts).rstrip()+'\n'
    if not dry:
        path.write_text(new_text,encoding='utf-8')
    return True, f'{len(topics)} topics'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--dry-run',action='store_true')
    ap.add_argument('--course')
    args=ap.parse_args()
    courses=[CONTENT/args.course] if args.course else sorted(p for p in CONTENT.iterdir() if p.is_dir())
    changed=skipped=0
    for c in courses:
        for f in sorted(c.glob('modulo-*.md')):
            ok,msg=migrate_file(f,args.dry_run)
            if ok: changed+=1
            else: skipped+=1
    print(f'changed={changed} skipped={skipped}')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
