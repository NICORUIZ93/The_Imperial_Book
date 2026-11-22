#!/usr/bin/env python3
from __future__ import annotations
import subprocess, sys, json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
base=ROOT/'docs/cursos'
labs=sorted(base.glob('*/labs/*/verify.sh'))
ok=pending=fail=0
results=[]
for v in labs:
    p=subprocess.run(['bash',str(v)],cwd=v.parent,capture_output=True,text=True)
    out=(p.stdout+p.stderr).strip().splitlines()
    last=out[-1] if out else ''
    all_out='\n'.join(out)
    status='ok' if p.returncode==0 and 'RESULTADO: OK' in all_out else ('pending' if 'PENDIENTE' in all_out else 'fail')
    if status=='ok': ok+=1
    elif status=='pending': pending+=1
    else: fail+=1
    results.append({'lab':str(v.relative_to(ROOT)),'status':status,'code':p.returncode,'last':last})
print(json.dumps({'ok':ok,'pending':pending,'fail':fail,'total':len(results)},ensure_ascii=False))
if '--verbose' in sys.argv:
    for r in results:
        if r['status']!='ok': print(r['status'],r['lab'],r['last'])
