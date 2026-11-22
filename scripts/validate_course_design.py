#!/usr/bin/env python3
from __future__ import annotations
import argparse, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSES = [
    ROOT/'docs/cursos/java-desde-cero',
    ROOT/'docs/cursos/springboot-microservicios-desde-cero',
    ROOT/'docs/cursos/node-microservicios-desde-cero',
]
REQUIRED = [f"### {i}. " for i in range(1,16)] + ["## FICHA DE TEMA:"]
PLACEHOLDERS = ['[nombre exacto]', '[Verbo Bloom]', '...', 'Pendiente', 'TODO']


def fichas():
    out=[]
    for c in COURSES:
        out.extend(sorted((c/'fichas').glob('*.md')))
    return out


def check_fichas(strict_all=False):
    errs=[]
    fs=fichas()
    if not fs:
        errs.append('no fichas found')
    for f in fs:
        t=f.read_text(encoding='utf-8')
        for req in REQUIRED:
            if req not in t:
                errs.append(f'{f.relative_to(ROOT)}: falta {req.strip()}')
        for ph in PLACEHOLDERS:
            if ph in t:
                errs.append(f'{f.relative_to(ROOT)}: placeholder {ph}')
        if 'Cuándo NO usarlo' not in t and 'Cuándo NO usar' not in t:
            errs.append(f'{f.relative_to(ROOT)}: falta cuando NO usarlo')
    if strict_all:
        # heuristic: master matrix has many rows; strict-all requires explicit marker file
        marker=ROOT/'docs/cursos/.all-fichas-complete'
        if not marker.exists():
            errs.append('strict-all: falta docs/cursos/.all-fichas-complete (solo crear con evidencia 100%)')
    return errs


def check_labs():
    errs=[]
    for c in COURSES:
        for f in sorted((c/'fichas').glob('*.md')):
            slug=f.stem
            lab=c/'labs'/slug
            if not lab.exists():
                errs.append(f'{f.relative_to(ROOT)}: falta lab {lab.relative_to(ROOT)}')
                continue
            for req in ['README.md','verify.sh']:
                if not (lab/req).exists():
                    errs.append(f'{lab.relative_to(ROOT)}: falta {req}')
            v=lab/'verify.sh'
            if v.exists():
                txt=v.read_text(encoding='utf-8')
                if 'PENDIENTE:' in txt:
                    errs.append(f'{v.relative_to(ROOT)}: PENDIENTE implementación/verificación real')
                elif 'RESULTADO: OK' not in txt:
                    errs.append(f'{v.relative_to(ROOT)}: falta RESULTADO: OK')
    return errs


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--check-labs', action='store_true')
    ap.add_argument('--strict-all', action='store_true')
    args=ap.parse_args()
    errs=[]
    if args.check or args.strict_all or not (args.check or args.check_labs):
        errs+=check_fichas(strict_all=args.strict_all)
    if args.check_labs or args.strict_all:
        errs+=check_labs()
    if errs:
        for e in errs:
            print(e)
        return 1
    print('validate_course_design: ok')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
