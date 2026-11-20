#!/usr/bin/env python3
"""Kit de verificación JVM (specs/019).

Convierte el código Java/Maven/Gradle de las lecciones en unidades ejecutables y
registra los laboratorios Maven/Gradle de examples/. Sin dependencias externas.

Uso:
  python3 extraer.py                       # genera build/ (unidades.tsv + una carpeta por unidad)
  python3 extraer.py --comparar UNIDAD LOG [--fallo]   # usado por run.sh
  python3 extraer.py --ejecutar SEG LOG DIR -- cmd...   # usado por run.sh (timeout con grupo de procesos)
"""
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import time

KIT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(KIT, '..', '..'))
CURSOS = ['java', 'spring-boot', 'microservices', 'rutaflow']
# Carpetas que la lección usa como nombre del mismo proyecto que vive en la raíz del espacio de trabajo
ALIAS_RAIZ = {'spring-boot': 'academia-spring'}
JDK_CURSO = {'java': 25, 'spring-boot': 25, 'microservices': 27, 'rutaflow': 25}
EXCLUIR_LABS = re.compile(r'android|kmp|kotlin-multiplatform|flutter', re.I)
BOOT = '4.1.2'
SPRING_CLOUD = '2025.1.4'

# Herramientas que el kit no levanta (servicios externos o fuera del alcance JVM).
EXTERNAS = ['docker', 'podman', 'kubectl', 'psql', 'pg_dump', 'createdb', 'flutter', 'dart', 'node', 'npm', 'npx',
            'terraform', 'cosign', 'helm', 'kind', 'minikube', 'aws', 'git', 'redis-cli', 'kafka-topics',
            'mysql', 'python3', 'python', 'kill', 'jcmd', 'jconsole', 'visualvm', 'mvn.cmd', 'archetype:generate',
            'gradle init', 'jshell', 'native-image', 'spring init', 'sdk ']
SERVIDOR_FUENTE = re.compile(r'HttpServer\.create|new ServerSocket|SpringApplication\.run|ServerSocketChannel\.open')
VERBOS_EDICION = re.compile(r'\b(cambia|elimina|borra|quita|agrega|añade|comenta|descomenta|renombra|reemplaza|'
                            r'modifica|sustituye|edita|mueve|deja|olvida|omite|retira|duplica|invierte|usa otro|'
                            r'sin detener|detén|deten|apaga|cierra|copia)\b', re.I)
PALABRAS_FALLO = re.compile(r'fall|error|excepci|exception|rechaz|lanza|termina con|aborta|no compila', re.I)


# ----------------------------------------------------------------------------- utilidades
def leer(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def escribir(p, txt, ejecutable=False):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt)
    if ejecutable:
        os.chmod(p, 0o755)


def slug(s, n=40):
    s = re.sub(r'[`*_]', '', s)
    s = re.sub(r'[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ]+', '-', s).strip('-').lower()
    for a, b in zip('áéíóúñ', 'aeioun'):
        s = s.replace(a, b)
    return s[:n].strip('-') or 'seccion'


def norm(p):
    p = p.strip().lstrip('./') if p.startswith('./') else p.strip()
    p = os.path.normpath(p) if p else p
    return '' if p == '.' else p


def unir(base, p):
    return norm(os.path.join(base, p)) if base else norm(p)


def quitar_cadenas(code):
    code = re.sub(r'"""[\s\S]*?"""', '""', code)
    code = re.sub(r'"(?:\\.|[^"\\\n])*"', '""', code)
    code = re.sub(r"'(?:\\.|[^'\\\n])'", "''", code)
    code = re.sub(r'//[^\n]*', '', code)
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    return code


def cadenas(code):
    return re.findall(r'"((?:\\.|[^"\\\n])*)"', code) + re.findall(r'"""([\s\S]*?)"""', code)


TIPO_RE = re.compile(r'^(?:@[\w.]+(?:\([^)]*\))?\s+)*(?:(?:public|protected|private|final|abstract|sealed|non-sealed|'
                     r'static|strictfp)\s+)*(class|record|interface|enum|@interface)\s+([A-Z]\w*)', re.M)


def tipos_top(code):
    """Tipos declarados en el nivel superior (profundidad 0 de llaves)."""
    limpio = quitar_cadenas(code)
    res = []
    prof = 0
    i = 0
    lineas = limpio.split('\n')
    for ln in lineas:
        if prof == 0:
            m = TIPO_RE.match(ln.strip())
            if m:
                res.append((m.group(1), m.group(2), 'public' in ln.split(m.group(1))[0]))
        prof += ln.count('{') - ln.count('}')
        i += 1
    return res, prof


def es_completo(code):
    """Un bloque Java es una unidad de compilación completa si tiene tipos de nivel superior,
    llaves balanceadas y nada suelto fuera de ellos; o es un archivo compacto (void main)."""
    if re.search(r'^\s*(//\s*)?\.\.\.\s*$|^\s*\.\.\.|//\s*\.\.\.|/\*\s*\.\.\.\s*\*/|\{\s*\.\.\.\s*\}', code, re.M):
        return False, 'contiene «...»'
    tipos, prof = tipos_top(code)
    if prof != 0:
        return False, 'llaves desbalanceadas'
    if re.search(r'^\s*module\s+[\w.]+\s*\{', quitar_cadenas(code), re.M):
        return True, ''
    limpio = quitar_cadenas(code)
    # quitar package/import/anotaciones y bloques de tipos; si queda código suelto → fragmento
    prof = 0
    suelto = []
    for ln in limpio.split('\n'):
        s = ln.strip()
        if prof == 0 and s and not re.match(r'(package|import)\s', s) and not s.startswith('@') \
                and not TIPO_RE.match(s) and s not in ('}', '{'):
            suelto.append(s)
        prof += ln.count('{') - ln.count('}')
    if not tipos:
        if re.match(r'\s*((import|package)[^\n]*\n\s*)*(\w+\s+)*void\s+main\s*\(', limpio):
            return True, 'compacto'
        return False, 'sin declaración de tipo'
    if suelto:
        # Archivos compactos (Java 25) pueden tener métodos y campos sueltos con void main
        if re.search(r'^\s*void\s+main\s*\(', limpio, re.M):
            return True, 'compacto'
        return False, 'código fuera de una clase'
    return True, ''


def paquete(code):
    m = re.search(r'^\s*package\s+([\w.]+)\s*;', code, re.M)
    return m.group(1) if m else ''


def clase_main(code):
    tipos, _ = tipos_top(code)
    if not re.search(r'\bvoid\s+main\s*\(', code):
        return None
    limpio = quitar_cadenas(code)
    # tipo que contiene main: el tipo top cuya región incluye main
    actual = None
    prof = 0
    for ln in limpio.split('\n'):
        if prof == 0:
            m = TIPO_RE.match(ln.strip())
            if m:
                actual = m.group(2)
        if re.search(r'\bvoid\s+main\s*\(', ln) and actual:
            return actual
        prof += ln.count('{') - ln.count('}')
    return tipos[0][1] if tipos else None


# ----------------------------------------------------------------------------- lectura de lecciones
def bloques(lineas):
    i = 0
    while i < len(lineas):
        m = re.match(r'^(\s{0,3})```\s*([\w+-]*)', lineas[i])
        if m:
            j = i + 1
            while j < len(lineas) and not re.match(r'^\s{0,3}```\s*$', lineas[j]):
                j += 1
            yield i, j, (m.group(2) or 'text').lower()
            i = j + 1
        else:
            i += 1


def secciones(lineas):
    """Divide por encabezados ##, ### y ####. Devuelve (nivel, titulo, ini, fin)."""
    heads = []
    en_code = False
    for i, l in enumerate(lineas):
        if re.match(r'^\s{0,3}```', l):
            en_code = not en_code
            continue
        if not en_code:
            m = re.match(r'^(#{2,4})\s+(.*)', l)
            if m:
                heads.append((len(m.group(1)), m.group(2).strip(), i))
    res = []
    if not heads or heads[0][2] > 0:
        res.append((1, 'Introducción', 0, heads[0][2] if heads else len(lineas)))
    for k, (niv, tit, i) in enumerate(heads):
        fin = heads[k + 1][2] if k + 1 < len(heads) else len(lineas)
        res.append((niv, tit, i, fin))
    return res


def menciones_jdk(texto):
    vals = [int(x) for x in re.findall(r'\b(?:JDK|Java|java)\s+(2[1-7])\b', texto)]
    return max(vals) if vals else None


def ruta_previa(lineas, i, desde):
    """Busca la ruta del archivo en las líneas anteriores al bloque (mismo párrafo)."""
    texto = []
    k = i - 1
    while k >= desde and len(texto) < 4:
        if re.match(r'^\s{0,3}```', lineas[k]):
            break
        texto.insert(0, lineas[k])
        if lineas[k].startswith('#'):
            break
        k -= 1
    t = ' '.join(texto)
    return t


EXT_RE = r'[^`\s]+\.(?:java|xml|kts|gradle|properties|yml|yaml|json|sql|proto|graphqls|imports|factories)'


def rutas_en(t):
    rs = re.findall(r'`(' + EXT_RE + r')`', t)
    rs += re.findall(r'`([\w./-]*META-INF/[\w./-]+)`', t)
    if not rs:
        rs = re.findall(r'(?<![`\w/.-])([\w-]+(?:/[\w.-]+)*\.(?:java|xml|kts|gradle|properties|yml|yaml))\b(?!`)', t)
    return [r for r in rs if not r.startswith('-')]


# ----------------------------------------------------------------------------- comprobaciones esperadas
def fragmentos(texto, codigo):
    """Extrae comprobaciones de un párrafo «Resultado esperado» / «Error esperado».
    Devuelve lista de grupos; cada grupo es una lista de alternativas (cualquiera basta)."""
    # solo las oraciones que describen la salida: la primera y las que dicen imprime/muestra/...
    tic = re.findall(r'`[^`]*`', texto)
    enmasc = re.sub(r'`[^`]*`', lambda m, c=iter(range(10 ** 6)): '\x00%d\x00' % next(c), texto)
    oraciones = re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ¿(\x00])', enmasc)
    elegidas = [o for k, o in enumerate(oraciones) if k == 0 or re.search(
        r'\b(imprime|muestra|aparece|salida|termina|responde|devuelve|informa|escribe|reporta|ves|verás)\b', o)]
    texto = re.sub(r'\x00(\d+)\x00', lambda m: tic[int(m.group(1))], ' '.join(elegidas))
    texto = re.split(r'(?<=[.;])\s+(?=(?:Compara|Ahora|Luego|Después|Antes|Si |Recuerda|Nota|Observa|Esto|'
                     r'Ese|Esa|Este|Esta|La diferencia|El orden exacto|En Windows|El modo|El compilador)\b)',
                     texto)[0]
    sin_cad = quitar_cadenas(codigo)
    lits = '\n'.join(cadenas(codigo))
    grupos = []
    # alternativas: `A` o `B`, `A` / `B`
    tokens = list(re.finditer(r'`([^`]+)`', texto))
    usados = set()
    for idx, m in enumerate(tokens):
        if idx in usados:
            continue
        grupo = [m.group(1)]
        j = idx
        while j + 1 < len(tokens):
            entre = texto[tokens[j].end():tokens[j + 1].start()]
            if re.fullmatch(r'\s*(o|u|/|ó|or)\s*', entre):
                grupo.append(tokens[j + 1].group(1))
                usados.add(j + 1)
                j += 1
            else:
                break
        antes = texto[max(0, m.start() - 30):m.start()].lower()
        if re.search(r'\b(no|sin|nunca|ni|en lugar de|en vez de|ningún|ninguna)\s+(\w+\s+){0,2}$', antes):
            continue
        buenos = [g for g in grupo if util_como_salida(g, sin_cad, lits)]
        if len(buenos) == len(grupo) and buenos:
            grupos.append(buenos)
    return grupos


def util_como_salida(f, sin_cad, lits):
    f = f.strip()
    if len(f) < 1:
        return False
    if re.match(r'^(\$ )?(java|javac|javap|jar|jdeps|jlink|mvn|\./mvnw|\./gradlew|gradle|curl|cd|rm|mkdir|cp|'
                r'export|set|echo|cat|grep|kill|docker|kubectl|psql|git)\b\s', f):
        return False
    if re.fullmatch(r'-{1,2}[\w.:=-]+', f):  # opciones de línea de comandos
        return False
    if re.fullmatch(r'[\w./${}-]+\.(java|class|jar|txt|md|xml|jfr|jsa|properties|yml|yaml|json|csv|sql|log|sh|kts|'
                    r'gradle|html|proto|imports)', f):
        return False
    if re.fullmatch(r'[\w.-]*/[\w./-]*', f) and not re.search(r'\d', f.split('/')[-1] or 'x'):
        return False  # rutas de carpetas
    if f.startswith('@') and re.fullmatch(r'@[\w.]+', f):
        return False
    if re.search(r'\d\s*[×*/+]\s*\d', f) and not re.search(r'[=:]', f):
        return False  # cuentas escritas en la prosa
    if not re.search(r'\w', f):
        return False  # operadores sueltos como «==»
    if re.fullmatch(r'\.\w{1,10}', f):
        return False  # extensiones como «.class»
    if re.fullmatch(r'[A-Za-z_]\w*(\.\w+)*(\(\))?', f) and ('.' in f or '(' in f) and f in sin_cad:
        return False
    if re.fullmatch(r'[A-Za-z_]\w*(\.\w+)*\(\)', f) or re.search(r'[;{}]', f):
        return False  # llamadas o código
    if re.fullmatch(r'[A-Za-z_]{1,2}', f):
        return False
    if re.fullmatch(r'[A-Z]\w*', f) and re.search(r'\b(class|record|interface|enum)\s+' + re.escape(f) + r'\b', sin_cad):
        return False  # nombre de un tipo declarado: la prosa habla del código
    if re.fullmatch(r'[A-Za-z_$][\w$]*', f) and f not in ('true', 'false', 'null'):
        # identificador suelto: sirve si aparece como texto impreso o no aparece en el código
        if re.search(r'\b' + re.escape(f) + r'\b', lits):
            return True
        if re.search(r'\b' + re.escape(f) + r'\b', sin_cad):
            return False
        return bool(re.search(r'(Exception|Error|SUCCESS|FAIL)', f)) or f.isupper()
    if f in sin_cad and f not in lits:
        return False
    if re.fullmatch(r'[\w.]+\.[a-z]\w*', f) and f in sin_cad:
        return False
    return True


def patron(f):
    """Convierte un fragmento con marcadores (<número>, ..., …) en regex."""
    partes = re.split(r'(<[^<>]{1,40}>|\.\.\.|…)', f)
    rx = ''
    for p in partes:
        if not p:
            continue
        if p in ('...', '…') or (p.startswith('<') and p.endswith('>') and not re.fullmatch(r'<\w+>', p)
                                 or re.fullmatch(r'<[^<>]*[\sáéíóúñ][^<>]*>|<(número|numero|n|pid|valor|id|uuid|'
                                                 r'hora|fecha|ruta|puerto|ms|tiempo|hash|token|x)>', p or '')):
            rx += r'.*?'
        else:
            rx += r'\s+'.join(re.escape(x) for x in p.split())
            if p[:1].isspace():
                rx = rx  # espacios iniciales ya tolerados
    return rx


# ----------------------------------------------------------------------------- estado de un espacio de trabajo
class Espacio:
    def __init__(self, nombre):
        self.nombre = nombre
        self.archivos = {}        # ruta -> contenido
        self.sucios = {}          # ruta -> origen del fragmento no aplicado
        self.pom_snippets = {}    # raiz -> list de xml
        self.pom_sucio = {}       # raiz -> origen
        self.raices_lec = set()   # raíces con pom.xml completo dado por la lección
        self.dirs = set()         # carpetas conocidas (para cd)
        self.virtuales = set()    # rutas que crean los propios comandos (cp desde examples/)

    def poner(self, ruta, txt):
        self.archivos[ruta] = txt
        self.sucios.pop(ruta, None)
        d = os.path.dirname(ruta)
        while d:
            self.dirs.add(d)
            d = os.path.dirname(d)


# ----------------------------------------------------------------------------- dependencias Spring
MAPA_DEPS = [
    ('org.springframework.boot.webmvc.test', [('spring-boot-starter-webmvc-test', 'test')]),
    ('org.springframework.test.web.servlet', [('spring-boot-starter-webmvc-test', 'test')]),
    ('org.springframework.boot.data.jpa.test', [('spring-boot-starter-data-jpa-test', 'test')]),
    ('org.springframework.boot.data', [('spring-boot-starter-data-jpa-test', 'test')]),
    ('org.springframework.boot.jdbc.test', [('spring-boot-starter-jdbc-test', 'test')]),
    ('org.springframework.boot.webflux.test', [('spring-boot-starter-webflux-test', 'test')]),
    ('org.springframework.security.test', [('spring-security-test', 'test', 'org.springframework.security')]),
    ('org.springframework.boot.test', []), ('org.springframework.test', []), ('org.junit', []),
    ('org.assertj', []), ('org.mockito', []), ('org.hamcrest', []), ('com.jayway.jsonpath', []),
    ('org.springframework.boot.webmvc', [('spring-boot-starter-webmvc', None)]),
    ('org.springframework.web.reactive', [('spring-boot-starter-webflux', None)]),
    ('reactor.core', [('spring-boot-starter-webflux', None)]),
    ('org.springframework.web', [('spring-boot-starter-webmvc', None)]),
    ('org.springframework.http', [('spring-boot-starter-webmvc', None)]),
    ('jakarta.servlet', [('spring-boot-starter-webmvc', None)]),
    ('jakarta.persistence', [('spring-boot-starter-data-jpa', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.springframework.data.jpa', [('spring-boot-starter-data-jpa', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.hibernate', [('spring-boot-starter-data-jpa', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.springframework.data.mongodb', [('spring-boot-starter-data-mongodb', None)]),
    ('org.springframework.data.relational', [('spring-boot-starter-data-jdbc', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.springframework.data', [('spring-boot-starter-data-jpa', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.springframework.jdbc', [('spring-boot-starter-jdbc', None), ('h2', 'runtime', 'com.h2database')]),
    ('org.springframework.boot.jdbc', [('spring-boot-starter-jdbc', None), ('h2', 'runtime', 'com.h2database')]),
    ('javax.sql', []),
    ('jakarta.validation', [('spring-boot-starter-validation', None)]),
    ('org.springframework.validation', [('spring-boot-starter-validation', None)]),
    ('org.springframework.security.oauth2.server.resource', [('spring-boot-starter-oauth2-resource-server', None)]),
    ('org.springframework.security.oauth2.jwt', [('spring-boot-starter-oauth2-resource-server', None)]),
    ('org.springframework.security', [('spring-boot-starter-security', None)]),
    ('org.springframework.boot.actuate', [('spring-boot-starter-actuator', None)]),
    ('org.springframework.boot.health', [('spring-boot-starter-actuator', None)]),
    ('io.micrometer', [('spring-boot-starter-actuator', None)]),
    ('org.springframework.kafka', [('spring-boot-starter-kafka', None)]),
    ('org.springframework.amqp', [('spring-boot-starter-amqp', None)]),
    ('org.springframework.batch', [('spring-boot-starter-batch', None)]),
    ('org.springframework.cache', [('spring-boot-starter-cache', None)]),
    ('org.springframework.mail', [('spring-boot-starter-mail', None)]),
    ('org.springframework.graphql', [('spring-boot-starter-graphql', None)]),
    ('org.flywaydb', [('spring-boot-starter-flyway', None)]),
    ('org.testcontainers.postgresql', [('testcontainers-postgresql', 'test', 'org.testcontainers'),
                                       ('postgresql', 'runtime', 'org.postgresql')]),
    ('org.testcontainers.containers.PostgreSQLContainer', [('testcontainers-postgresql', 'test', 'org.testcontainers'),
                                                           ('postgresql', 'runtime', 'org.postgresql')]),
    ('org.springframework.boot.testcontainers', [('spring-boot-testcontainers', 'test')]),
    ('org.testcontainers', [('spring-boot-testcontainers', 'test'),
                            ('testcontainers-junit-jupiter', 'test', 'org.testcontainers')]),
    ('org.springframework', []), ('org.slf4j', []), ('jakarta.annotation', []), ('java.', []), ('javax.', []),
    ('tools.jackson', [('spring-boot-starter-webmvc', None)]),
    ('com.fasterxml.jackson', []),  # Jackson 2: llega de forma transitiva (p. ej. jjwt-jackson); si no, el FAIL lo muestra
]


def deps_para(imports, propios, snippets_xml):
    deps = []
    faltan = []
    grupos_snip = set(re.findall(r'<groupId>([^<]+)</groupId>', '\n'.join(snippets_xml)))
    for imp in sorted(set(imports)):
        if any(imp == p or imp.startswith(p + '.') for p in propios):
            continue
        hit = None
        for pref, ds in MAPA_DEPS:
            if imp == pref or imp.startswith(pref if pref.endswith('.') else pref + '.') or imp == pref:
                hit = ds
                break
        if hit is None and imp.startswith('io.swagger') and any('springdoc' in x for x in snippets_xml):
            continue
        if hit is None:
            raiz2 = '.'.join(imp.split('.')[:2])
            if any(g == raiz2 or g.startswith(raiz2 + '.') or raiz2.startswith(g) for g in grupos_snip):
                continue
            faltan.append(imp)
            continue
        for d in hit:
            if d not in deps:
                deps.append(d)
    return deps, faltan


def pom_sintetico(nombre, jdk, deps, snippets, usa_cloud):
    filas = []
    vistos = set()
    props, plugins, paths = [], [], []
    for s in snippets:
        for pa in re.findall(r'<path>[\s\S]*?</path>', s):
            if pa.strip() not in paths:
                paths.append(pa.strip())
        s = re.sub(r'<plugin>\s*<groupId>org.apache.maven.plugins</groupId>\s*<artifactId>maven-compiler-plugin'
                   r'</artifactId>[\s\S]*?</plugin>|<path>[\s\S]*?</path>', '', s)
        for dep in re.findall(r'<dependency>[\s\S]*?</dependency>', s):
            a = re.search(r'<artifactId>([^<]+)', dep)
            if a and a.group(1) not in vistos:
                vistos.add(a.group(1))
                filas.append('    ' + dep.strip())
        for pl in re.findall(r'<plugin>[\s\S]*?</plugin>', s):
            plugins.append('      ' + pl.strip())
        resto = re.sub(r'<dependency>[\s\S]*?</dependency>|<plugin>[\s\S]*?</plugin>|<!--[\s\S]*?-->', '', s)
        for p in re.findall(r'<([\w.-]+\.version)>([^<]*)</\1>', resto):
            props.append('    <%s>%s</%s>' % (p[0], p[1], p[0]))
    base = [('spring-boot-starter', None), ('spring-boot-starter-test', 'test')]
    for d in base + deps:
        art, scope = d[0], d[1]
        grp = d[2] if len(d) > 2 else 'org.springframework.boot'
        if art in vistos:
            continue
        vistos.add(art)
        filas.append('    <dependency><groupId>%s</groupId><artifactId>%s</artifactId>%s</dependency>'
                     % (grp, art, '<scope>%s</scope>' % scope if scope else ''))
    if paths:
        plugins.append('      <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin'
                       '</artifactId><configuration><annotationProcessorPaths>\n'
                       + '\n'.join('        ' + x for x in paths) + '\n      </annotationProcessorPaths></configuration></plugin>')
    dm = ''
    if usa_cloud:
        dm = ('  <dependencyManagement><dependencies><dependency><groupId>org.springframework.cloud</groupId>'
              '<artifactId>spring-cloud-dependencies</artifactId><version>%s</version><type>pom</type>'
              '<scope>import</scope></dependency></dependencies></dependencyManagement>\n' % SPRING_CLOUD)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- Generado por verificacion/jvm/extraer.py: proyecto equivalente al de Spring Initializr. -->\n'
            '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            'xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">\n'
            '  <modelVersion>4.0.0</modelVersion>\n'
            '  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId>'
            '<version>%s</version><relativePath/></parent>\n'
            '  <groupId>com.example</groupId><artifactId>%s</artifactId><version>0.0.1-SNAPSHOT</version>\n'
            '  <properties>\n    <java.version>%d</java.version>\n%s  </properties>\n%s'
            '  <dependencies>\n%s\n  </dependencies>\n'
            '  <build><plugins>\n      <plugin><groupId>org.springframework.boot</groupId>'
            '<artifactId>spring-boot-maven-plugin</artifactId></plugin>\n%s    </plugins></build>\n</project>\n'
            % (BOOT, nombre, jdk, ''.join(p + '\n' for p in props), dm, '\n'.join(filas),
               ''.join(p + '\n' for p in plugins)))


SHIM_MVNW = '#!/usr/bin/env bash\n# Sustituto del Maven Wrapper de Spring Initializr (kit de verificación).\nexec mvn "$@"\n'
SHIM_GRADLEW = '#!/usr/bin/env bash\n# Sustituto del Gradle Wrapper (kit de verificación).\nexec gradle "$@"\n'


# ----------------------------------------------------------------------------- extracción principal
class Extractor:
    def __init__(self, out):
        self.pendientes = None
        self.cwd_tema = ''
        self._sim_final = ''
        self.out = out
        self.unidades = []
        self.n = 0

    def nueva(self, curso, etiqueta):
        self.n += 1
        uid = '%04d-%s' % (self.n, etiqueta)
        d = os.path.join(self.out, curso, uid)
        os.makedirs(d, exist_ok=True)
        return uid, d

    # ------------------------------------------------------------------ lecciones
    def curso(self, curso):
        base = os.path.join(REPO, 'web', 'public', 'content', curso)
        mods = sorted([f for f in os.listdir(base) if re.match(r'modulo-\d+\.md$', f)],
                      key=lambda x: int(re.findall(r'\d+', x)[0]))
        esp = Espacio('ws-' + curso)
        for mod in mods:
            self.modulo(curso, mod, esp)

    def modulo(self, curso, mod, esp):
        rel = '%s/%s' % (curso, mod)
        lineas = leer(os.path.join(REPO, 'web', 'public', 'content', curso, mod)).split('\n')
        jdk_tema = None
        lab_tema = None
        self.pendientes = None
        self.cwd_tema = ''
        for niv, tit, ini, fin in secciones(lineas):
            texto_prosa = self.prosa(lineas, ini, fin)
            j = menciones_jdk(texto_prosa)
            labm = re.search(r'`(examples/[\w.-]+)/?`', texto_prosa)
            if niv <= 3:
                self.pendientes = None
                self.cwd_tema = ''
                jdk_tema = j
                lab_tema = labm.group(1) if labm else None
            self.seccion(curso, rel, lineas, ini, fin, tit, esp,
                         j or jdk_tema or JDK_CURSO[curso], (labm.group(1) if labm else None) or lab_tema)

    def prosa(self, lineas, ini, fin):
        res = []
        en = False
        for l in lineas[ini:fin]:
            if re.match(r'^\s{0,3}```', l):
                en = not en
                continue
            if not en:
                res.append(l)
        return '\n'.join(res)

    def seccion(self, curso, rel, lineas, ini, fin, titulo, esp, jdk, lab):
        self._curso = curso
        bls = [b for b in bloques(lineas[ini:fin])]
        bls = [(a + ini, b + ini, lang) for a, b, lang in bls]
        java_bls = [b for b in bls if b[2] == 'java']
        cmd_bls = [b for b in bls if b[2] in ('bash', 'sh', 'shell', 'console', 'zsh')]
        grupos = [lineas[a + 1:b] for a, b, _ in cmd_bls]
        prosa0 = self.prosa(lineas, ini, fin)
        corre = re.compile(r'(^|[\s;&|(])(java|javac|mvn|\./mvnw|gradle|\./gradlew)\s')
        if not any(corre.search(l) for g in grupos for l in g):
            # comandos escritos en la prosa: «Compila y ejecuta `javac ...` y `java ...`»
            inl = [c for c in re.findall(r'`((?:javac|java|mvn|\./mvnw|gradle|\./gradlew)\s[^`]+)`',
                                         prosa0.split('**Fallo deliberado')[0])
                   if not re.search(r'<|\.\.\.', c)]
            if inl and java_bls:
                inl = [l for g in grupos for l in g] + inl
                for mrep in re.finditer(r'repite con `([^`]+)`|y (?:luego )?con `([^`]+)`', prosa0):
                    ultimo = next((c for c in reversed(inl) if c.startswith('java ')), None)
                    val = mrep.group(1) or mrep.group(2)
                    if ultimo and len(ultimo.split()) > 3 and not val.startswith(('java', '-')):
                        inl.append(' '.join(ultimo.split()[:-1] + [val]))
                grupos = [inl]
        jvm_cmd = any(re.search(r'(^|[\s;&|(])(java|javac|javap|jar|jdeps|jlink|jdeprscan|jfr|mvn|\./mvnw|gradle|'
                                r'\./gradlew)(\s|$)', '\n'.join(g)) for g in grupos)
        if not java_bls and not jvm_cmd:
            # aun así, los archivos de configuración con ruta se aplican al espacio de trabajo
            for a, b, lang in bls:
                if lang in ('xml', 'yaml', 'yml', 'properties', 'kotlin', 'groovy', 'sql', 'json', 'text', 'protobuf'):
                    self.aplicar_otro(esp, lineas, a, b, lang, ini, '', rel, [])
            return
        prosa = self.prosa(lineas, ini, fin)
        origen = '%s:%d' % (rel, (java_bls or cmd_bls)[0][0] + 1)
        uid, d = self.nueva(curso, re.sub(r'\.md$', '', os.path.basename(rel)) + '-' + slug(titulo, 34))
        info = {'id': uid, 'curso': curso, 'origen': origen, 'jdk': jdk, 'ws': esp.nombre, 'titulo': titulo,
                'tipo': 'leccion'}
        motivos = []
        escritos = []      # rutas escritas por esta unidad
        notas = []

        # --- carpeta de trabajo deducida de la prosa y de los cd
        cwd = ''
        mdesde = re.search(r'[Dd]esde (?:la carpeta |el directorio |la raíz de |dentro de )?`([^`]+?)/?`', prosa) or \
            re.search(r'[Dd]esde (?:la carpeta |el directorio )?()([\w.-]+(?:/[\w.-]+)*)/[,:\s]', prosa)
        if mdesde and mdesde.lastindex == 2:
            mdesde = re.search(r'([\w.-]+(?:/[\w.-]+)*)', mdesde.group(2))
        if mdesde and not mdesde.group(1).startswith('examples/') and '.' not in os.path.basename(mdesde.group(1)):
            cwd = norm(mdesde.group(1))
        if mdesde and mdesde.group(1).startswith('examples/'):
            lab = norm(mdesde.group(1))
        cd_inicial = None
        for g in grupos:
            for l in g:
                m = re.match(r'^\s*(?:mkdir\s+(?:-p\s+)?[^&;]+&&\s*)?cd\s+([\w./-]+)\s*(?:&&.*)?$', l)
                if m and cd_inicial is None:
                    cd_inicial = norm(m.group(1))
        cwd = self.alias(curso, cwd)
        cd_inicial = self.alias(curso, cd_inicial) if cd_inicial else cd_inicial
        dir_archivos = cwd or (cd_inicial if cd_inicial and not cd_inicial.startswith('examples') else '')

        # --- clases nombradas en los comandos (para deducir rutas)
        cmds_txt = '\n'.join('\n'.join(g) for g in grupos)
        rutas_cmd = re.findall(r'([\w./-]+\.java)\b', cmds_txt)

        # --- archivos Java
        for a, b, lang in bls:
            if lang != 'java':
                if lang in ('xml', 'yaml', 'yml', 'properties', 'kotlin', 'groovy', 'sql', 'json', 'protobuf'):
                    self.aplicar_otro(esp, lineas, a, b, lang, ini, dir_archivos, rel, escritos, motivos)
                elif lang in ('text', 'csv', 'txt', 'plain'):
                    self.aplicar_datos(esp, lineas, a, b, ini, dir_archivos, escritos)
                continue
            code = '\n'.join(lineas[a + 1:b])
            pre = ruta_previa(lineas, a, ini)
            rs = rutas_en(pre)
            m1 = re.match(r'\s*//\s*([\w./-]+\.java)\b', code)
            ok, porque = es_completo(code)
            pkg = paquete(code)
            tipos, _ = tipos_top(code)
            nombre_pub = next((t[1] for t in tipos if t[2]), None) or clase_main(code) or (tipos[0][1] if tipos else None)
            rs_ex = [r for r in rs if r.startswith('examples/')]
            if rs_ex and len(rs_ex) < len(rs) and re.search(r'\b[Cc]rea\b', pre) and not m1:
                # «Crea `x/src/A.java` copiando `examples/.../A.java`»: se crea en el espacio y se compara con el laboratorio
                self.extracto(info, d, code, rs_ex[-1], lab, a, rel)
                rs = [r for r in rs if not r.startswith('examples/')]
            por_nombre = [r for r in rs if nombre_pub and os.path.basename(r) == nombre_pub + '.java']
            ruta = m1.group(1) if m1 else (por_nombre[-1] if por_nombre else (rs[-1] if rs else None))
            if ruta and not m1 and not por_nombre and len(rs) > 1 and nombre_pub and \
                    any(os.path.basename(r)[:-5] in code for r in rs):
                ruta = None  # el párrafo nombra varios archivos y ninguno es esta clase
            abre = re.search(r'\b(Abre|abre|Revisa|revisa|consulta|Consulta|localiza|Localiza|Lee|lee|Observa|'
                             r'Mira|mira|fragmento|extracto)\b', pre)
            if ruta and (ruta.startswith('examples/') or (lab and abre and not re.search(r'\b[Cc]rea\b', pre))):
                self.extracto(info, d, code, ruta, lab, a, rel)
                continue
            if ruta is None and nombre_pub:
                cand = [r for r in rutas_cmd if os.path.basename(r) == nombre_pub + '.java']
                if cand and cand[0].startswith('examples/'):
                    # el guion copia el archivo desde examples/: se compara el bloque con ese archivo
                    self.extracto(info, d, code, cand[0], lab, a, rel)
                    continue
                if cand:
                    ruta = unir(cwd, cand[0])
                elif ok and curso in ('java', 'microservices', 'rutaflow') and not pkg:
                    existentes = [r for r in esp.archivos if os.path.basename(r) == nombre_pub + '.java']
                    ruta = existentes[-1] if existentes else unir(dir_archivos, 'src/%s.java' % nombre_pub)
                elif ok and pkg:
                    existentes = [r for r in esp.archivos if r.endswith('/'.join(pkg.split('.')) + '/' + nombre_pub + '.java')]
                    ruta = existentes[-1] if existentes else unir(dir_archivos, 'src/main/java/%s/%s.java' % (pkg.replace('.', '/'), nombre_pub))
            if ruta is None:
                if lab and not ok:
                    self.extracto(info, d, code, None, lab, a, rel)
                    continue
                if not ok:
                    notas.append('fragmento sin archivo en %s:%d (%s)' % (rel, a + 1, porque))
                continue
            ruta = self.alias(curso, norm(ruta))
            if '/' not in ruta and not ruta.startswith(dir_archivos or '\0'):
                existentes = [r for r in esp.archivos if os.path.basename(r) == ruta]
                if not ok and existentes:
                    ruta = existentes[-1]
                else:
                    ruta = unir(dir_archivos, ruta)
            elif dir_archivos and not ruta.startswith(dir_archivos.split('/')[0] + '/') and \
                    (ruta.split('/')[0] in ('src', 'out', 'datos', 'lib', 'plugins') or
                     not any(ruta.startswith(x + '/') for x in esp.dirs if '/' not in x)) and not ruta.startswith('examples/'):
                ruta = unir(dir_archivos, ruta)
            if ruta.startswith('..') or os.path.isabs(ruta) or ruta.startswith('examples/'):
                motivos.append('la lección escribe en `%s`, fuera del espacio de trabajo (los laboratorios se verifican aparte)' % ruta)
                continue
            if ok and porque == 'compacto' and ruta in esp.archivos and tipos_top(esp.archivos[ruta])[0] \
                    and not re.search(r'[Rr]eemplaza|contenido completo|archivo completo', pre):
                ok, porque = False, 'método suelto para una clase existente'
            if not ok:
                esp.sucios[ruta] = '%s:%d' % (rel, a + 1)
                motivos.append('fragmento parcial de `%s` (%s:%d, %s)' % (ruta, rel, a + 1, porque))
                continue
            esp.poner(ruta, code + '\n')
            escritos.append(ruta)

        # --- cambio descrito solo en prosa: «En `src/Guia.java` conserva ... y crea ...»
        hazlo = re.split(r'\*\*Resultado esperado', prosa0)[0]
        hazlo = hazlo.split('**2. Hazlo tú**')[-1] if '**2. Hazlo tú**' in hazlo else hazlo
        if not java_bls and grupos and re.search(
                r'\b(En|Dentro de|Edita|Modifica|Abre)\s+`[^`]+\.java`[^.]*\b(conserva|crea|agrega|añade|cambia|imprime|'
                r'reemplaza|quita|elimina|declara|usa|llama|pon)\b|\b(Agrega|Añade|Cambia|Reemplaza|Quita|Elimina|'
                r'Sustituye|Modifica)\b[^.]*`', hazlo):
            motivos.append('la lección describe el cambio del código solo en prosa (sin bloque de código)')
        for mprop in re.finditer(r'`([\w./-]+\.properties)` con `([^`]+=[^`]*)`', prosa0):
            rprop = unir(cwd, mprop.group(1)) if cwd and '/' not in mprop.group(1) else norm(mprop.group(1))
            if not rprop.startswith('examples/'):
                esp.poner(rprop, mprop.group(2) + '\n')
                escritos.append(rprop)
        for mdat in re.finditer(r'[Cc]rea `([\w./-]+\.(?:txt|csv))` con (?:varias|algunas|unas|tres|dos)', prosa0):
            rdat = unir(cwd, mdat.group(1)) if cwd and '/' not in mdat.group(1) else norm(mdat.group(1))
            if rdat not in esp.archivos:
                esp.poner(rdat, 'RF-101 Medellin\nRF-102 Envigado\nRF-103 Bello\n')
                escritos.append(rdat)
                notas.append('datos de ejemplo generados para `%s`' % rdat)

        # --- comandos anticipados en el tema que usan los archivos de esta sección
        if not grupos and escritos and self.pendientes:
            pg, pcwd = self.pendientes
            nombres = {os.path.basename(r) for r in escritos}
            if any(n in '\n'.join(pg) for n in nombres):
                grupos = [pg]
                cwd = cwd or pcwd
        # --- entrada estándar: «Escribe `3` y luego ... `tres`»
        lee_stdin = any(re.search(r'Scanner\(System\.in\)|InputStreamReader\(System\.in\)|System\.in\.read|'
                                  r'System\.console\(\)|IO\.readln', esp.archivos.get(r, '')) for r in escritos)
        if lee_stdin and grupos:
            valores = re.findall(r'[Ee]scrib[ea]\w*\s+`([^`]+)`|repite escribiendo\s+`([^`]+)`|luego\s+`([^`]+)`', prosa0)
            valores = [next(x for x in v if x) for v in valores]
            if valores:
                nuevo = []
                for g in grupos:
                    for l in g:
                        if re.match(r'^\s*java\s', l) and '<' not in l and '|' not in l:
                            nuevo += ["printf '%%s\\n' %s | %s" % (sh_q(v), l.strip()) for v in valores]
                        else:
                            nuevo.append(l)
                grupos = [nuevo]

        # --- comandos
        self._escritos_seccion = set(escritos)
        primera = next((l.strip() for g in grupos for l in g if l.strip() and not l.strip().startswith('#')), '')
        if not cwd and self.cwd_tema and grupos and not re.match(r'(mkdir|cd)\s', primera) and not lab:
            cwd = self.cwd_tema  # la sección continúa en la carpeta donde terminó la anterior del mismo tema
        if ALIAS_RAIZ.get(curso):
            a = re.escape(ALIAS_RAIZ[curso])
            grupos = [[re.sub(r'(?<![\w/.-])' + a + r'/', '', re.sub(r'\bcd\s+' + a + r'/?(?=\s|$|&|;)', 'cd .', l))
                       for l in g] for g in grupos]
        guion, kinds, problemas = self.guion(esp, grupos, cwd, lab, curso)
        self.cwd_tema = self._sim_final
        if any(p.startswith('comando anticipado') for p in problemas) and not java_bls:
            self.pendientes = (sum(grupos, []), cwd)
        motivos += problemas

        # --- sin comandos: compilar y ejecutar lo escrito
        if not grupos and escritos:
            guion, auto_motivo = self.guion_auto(esp, escritos, curso)
            if auto_motivo:
                motivos.append(auto_motivo)
            kinds.add('javac')

        # --- proyecto Maven/Gradle: pom sintético o shim
        if kinds & {'maven', 'gradle'}:
            m = self.proyecto_build(esp, escritos, curso, jdk, guion, cwd, lab, info)
            if m:
                motivos.append(m)

        # --- fuentes sucias que esta unidad compilaría
        sucias = self.sucias_relevantes(esp, escritos, guion, kinds)
        if sucias:
            motivos.append('depende de un fragmento parcial no aplicable: ' + ', '.join(sucias))

        # --- esperado
        codigo_total = '\n'.join(t for r, t in esp.archivos.items() if r.endswith('.java')) + '\n' + \
            '\n'.join('\n'.join(lineas[a + 1:b]) for a, b, l in bls if l == 'java')
        esperado = self.esperado(lineas, ini, fin, codigo_total, grupos)
        fallo = self.fallo(lineas, ini, fin, codigo_total, grupos)

        # --- escribir unidad
        arch_dir = os.path.join(d, 'archivos')
        escritos = [r for r in escritos if not r.startswith(('examples/', '..'))]
        info['extra'] = [r for r in info.get('extra', []) if not r.startswith(('examples/', '..'))]
        for r in escritos:
            escribir(os.path.join(arch_dir, r), esp.archivos[r], ejecutable=r.endswith(('mvnw', 'gradlew')))
        for r in info.get('extra', []):
            escribir(os.path.join(arch_dir, r), esp.archivos[r], ejecutable=r.endswith(('mvnw', 'gradlew')))
        info['archivos'] = sorted(set(escritos + info.get('extra', [])))
        info['kinds'] = sorted(kinds)
        if not guion.strip() and not motivos:
            motivos.append('sin comandos ni programa ejecutable')
        if notas and not escritos and not motivos and not guion.strip():
            motivos.append(notas[0])
        info['esperado'] = esperado
        info['motivo_skip'] = '; '.join(dict.fromkeys(motivos)) if motivos else ''
        if lab and 'lab' not in info:
            info['lab'] = lab
        escribir(os.path.join(d, 'pasos.sh'), self.cabecera(info) + guion + self.pie(), True)
        escribir(os.path.join(d, 'esperado.json'), json.dumps(esperado, ensure_ascii=False, indent=1))
        escribir(os.path.join(d, 'origen.txt'),
                 '%s\nJDK %d\ntipo: %s\nespacio: %s\ncarpeta: %s\nsección: %s\n%s' % (
                     origen, jdk, '+'.join(sorted(kinds)) or '-', esp.nombre, cwd or '.', titulo,
                     ('SKIP: ' + info['motivo_skip'] + '\n') if info['motivo_skip'] else ''))
        if info['motivo_skip']:
            escribir(os.path.join(d, 'skip.txt'), info['motivo_skip'] + '\n')
        self.unidades.append(info)
        if fallo and not info['motivo_skip']:
            self.unidad_fallo(curso, info, fallo, esp)

    # ------------------------------------------------------------------ configuración, pom, etc.
    def aplicar_otro(self, esp, lineas, a, b, lang, ini, dir_archivos, rel, escritos, motivos=None):
        txt = '\n'.join(lineas[a + 1:b])
        pre = ruta_previa(lineas, a, ini)
        rs = rutas_en(pre)
        m1 = re.match(r'\s*(?://|#|<!--)\s*([\w./-]+\.(?:xml|kts|gradle|properties|yml|yaml|sql))\b', txt)
        ruta = m1.group(1) if m1 else (rs[-1] if rs else None)
        if lang == 'xml' and '<project' in txt:
            ruta = ruta if ruta and ruta.endswith('pom.xml') else unir(dir_archivos, 'pom.xml')
        if not ruta:
            if lang == 'xml' and re.search(r'<(dependency|plugin|path|[\w.-]+\.version)>', txt):
                raiz = dir_archivos
                esp.pom_snippets.setdefault(raiz, []).append(txt)
                if re.search(r'<execution>', txt):
                    esp.pom_sucio[raiz] = '%s:%d' % (rel, a + 1)
            return
        ruta = self.alias(self._curso, norm(ruta))
        if ruta.startswith('examples/'):
            return
        if dir_archivos and ('/' not in ruta or ruta.split('/')[0] == 'src') and ruta not in esp.archivos:
            ruta = unir(dir_archivos, ruta)
        if ruta.endswith('pom.xml'):
            raiz = os.path.dirname(ruta)
            if '<project' in txt and '</project>' in txt:
                esp.poner(ruta, txt + '\n')
                esp.raices_lec.add(raiz)
                escritos.append(ruta)
            else:
                esp.pom_snippets.setdefault(raiz, []).append(txt)
                if re.search(r'<execution>', txt):
                    esp.pom_sucio[raiz] = '%s:%d' % (rel, a + 1)
            return
        agrega = re.search(r'\b([Aa]grega|[Aa]ñade|[Ii]ncluye|[Ss]uma|[Aa]mplía)\b', pre)
        if agrega and ruta in esp.archivos and lang == 'properties':
            esp.poner(ruta, esp.archivos[ruta] + txt + '\n')
        elif agrega and ruta in esp.archivos:
            esp.sucios[ruta] = '%s:%d' % (rel, a + 1)
            return
        else:
            esp.poner(ruta, txt + '\n')
        escritos.append(ruta)

    def alias(self, curso, ruta):
        a = ALIAS_RAIZ.get(curso)
        if a and ruta:
            if ruta == a:
                return ''
            if ruta.startswith(a + '/'):
                return ruta[len(a) + 1:]
        return ruta

    def aplicar_datos(self, esp, lineas, a, b, ini, dir_archivos, escritos):
        pre = ruta_previa(lineas, a, ini)
        if not re.search(r'\b([Gg]uarda|[Cc]rea|[Ee]scribe|[Cc]opia este)\b', pre) or re.search(r'esperad', pre, re.I):
            return
        m = re.search(r'`([\w./-]+\.(?:txt|csv|json|tsv|dat|properties|MF|mf|list)|[\w./-]*META-INF/services/[\w.$-]+)`'
                      r'(?:\s+en\s+`([\w./-]+?)/?`)?', pre)
        if not m:
            return
        ruta = norm(m.group(1))
        if m.group(2):
            ruta = unir(m.group(2), ruta)
        elif dir_archivos and ('/' not in ruta or ruta.split('/')[0] in ('src', 'out', 'datos', 'lib')):
            ruta = unir(dir_archivos, ruta)
        if ruta.startswith(('examples/', '..')):
            return
        esp.poner(ruta, '\n'.join(lineas[a + 1:b]) + '\n')
        escritos.append(ruta)

    def raiz_proyecto(self, ruta):
        m = re.match(r'^(.*?)(?:^|/)src/(?:main|test)/', ruta)
        if m:
            return m.group(1).rstrip('/')
        return None

    def proyecto_build(self, esp, escritos, curso, jdk, guion, cwd, lab, info):
        """Prepara pom sintético + mvnw en las raíces Maven que usa la unidad (fuera de examples/)."""
        raices = set()
        for r in esp.archivos:
            rp = self.raiz_proyecto(r)
            if rp is not None and r.endswith('.java'):
                raices.add(rp)
        # raíz que usa esta unidad: la de sus archivos, o la carpeta de trabajo
        propias = {self.raiz_proyecto(r) for r in escritos if self.raiz_proyecto(r) is not None}
        objetivo = propias or ({cwd} if cwd in raices else set())
        if not objetivo:
            if re.search(r'(^|\s)cd\s+examples/|\bexamples/', guion) or lab:
                return None
            # comandos Maven/Gradle sin proyecto conocido: ¿lo crea el propio guion (cp -R examples/...)?
            if re.search(r'cp\s+-R\s+examples/', guion):
                return None
            if raices and '' in raices:
                objetivo = {''}
            else:
                return 'la lección no da un proyecto Maven/Gradle completo (sin pom.xml/build.gradle ni fuentes src/main)'
        extra = info.setdefault('extra', [])
        for raiz in objetivo:
            if raiz in esp.pom_sucio and raiz not in esp.raices_lec:
                return 'el pom.xml se modifica con un fragmento no aplicable (%s)' % esp.pom_sucio[raiz]
            gradle = any(esp.archivos.get(unir(raiz, x)) for x in ('build.gradle', 'build.gradle.kts'))
            if raiz in esp.raices_lec or gradle:
                pass
            else:
                if curso not in ('spring-boot', 'microservices', 'rutaflow'):
                    return 'la lección no da el pom.xml del proyecto `%s`' % (raiz or '.')
                fuentes = {r: t for r, t in esp.archivos.items() if r.endswith('.java') and
                           (r.startswith(raiz + '/') if raiz else not r.startswith('examples/')) and
                           self.raiz_proyecto(r) == raiz}
                imports = []
                propios = set()
                for r, t in fuentes.items():
                    imports += [x[1] for x in re.findall(r'^\s*import\s+(static\s+)?([\w.]+)', t, re.M)]
                    p = paquete(t)
                    if p:
                        propios.add(p)
                deps, faltan = deps_para(imports, propios, esp.pom_snippets.get(raiz, []))
                if faltan:
                    return 'no se puede deducir la dependencia Maven de: ' + ', '.join(sorted(set(faltan))[:4])
                usa_cloud = any(i.startswith('org.springframework.cloud') for i in imports)
                if not any('@SpringBootApplication' in t for t in fuentes.values()):
                    pkgs = sorted({paquete(t) for r, t in fuentes.items() if '/src/main/' in '/' + r and paquete(t)},
                                  key=len)
                    base = pkgs[0] if pkgs else 'com.example.demo'
                    for p in pkgs:
                        while not all(q == p or q.startswith(p + '.') for q in pkgs) and '.' in p:
                            p = p.rsplit('.', 1)[0]
                        base = p if len(p) <= len(base) else base
                    app = unir(raiz, 'src/main/java/%s/DemoApplication.java' % base.replace('.', '/'))
                    esp.poner(app, 'package %s;\n\nimport org.springframework.boot.SpringApplication;\n'
                                   'import org.springframework.boot.autoconfigure.SpringBootApplication;\n\n'
                                   '// Generado por el kit: clase principal que crea Spring Initializr.\n'
                                   '@SpringBootApplication\npublic class DemoApplication {\n'
                                   '    public static void main(String[] args) {\n'
                                   '        SpringApplication.run(DemoApplication.class, args);\n    }\n}\n' % base)
                    extra.append(app)
                pom = unir(raiz, 'pom.xml')
                esp.poner(pom, pom_sintetico(slug(raiz or 'demo') or 'demo', max(jdk, 21), deps,
                                             esp.pom_snippets.get(raiz, []), usa_cloud))
                extra.append(pom)
            if not gradle:
                sh = unir(raiz, 'mvnw')
                if sh not in esp.archivos:
                    esp.poner(sh, SHIM_MVNW)
                    extra.append(sh)
            else:
                sh = unir(raiz, 'gradlew')
                if sh not in esp.archivos:
                    esp.poner(sh, SHIM_GRADLEW)
                    extra.append(sh)
        return None

    def sucias_relevantes(self, esp, escritos, guion, kinds):
        res = []
        for r, org in esp.sucios.items():
            nombre = os.path.basename(r)[:-5] if r.endswith('.java') else os.path.basename(r)
            if nombre in guion or os.path.basename(r) in guion:
                res.append('%s (%s)' % (r, org))
                continue
            if kinds & {'maven', 'gradle'}:
                raiz_r = self.raiz_proyecto(r)
                if any(self.raiz_proyecto(e) == raiz_r for e in escritos) and raiz_r is not None:
                    res.append('%s (%s)' % (r, org))
                    continue
            if r.endswith('.java') and any(re.search(r'\b' + re.escape(nombre) + r'\b', esp.archivos.get(e, ''))
                                           for e in escritos if e.endswith('.java') and e != r
                                           and self.raiz_proyecto(e) == self.raiz_proyecto(r)
                                           and os.path.dirname(e).split('/src/')[0] == os.path.dirname(r).split('/src/')[0]):
                res.append('%s (%s)' % (r, org))
        return res

    # ------------------------------------------------------------------ guiones
    def guion(self, esp, grupos, cwd, lab, curso):
        out = []
        kinds = set()
        problemas = []
        n_srv = 0
        if cwd:
            out.append('mkdir -p %s && cd %s' % (sh_q(cwd), sh_q(cwd)))
        elif lab and not any(re.search(r'\bcd\s+(\S*/)?examples/', '\n'.join(g)) for g in grupos):
            if any(re.search(r'(\./mvnw|\./gradlew|\./scripts/)', '\n'.join(g)) for g in grupos):
                out.append('cd %s' % sh_q(lab))
        heredoc = None
        sim = cwd or ''
        anticipados = []
        for g in grupos:
            for l in g:
                s = l.strip()
                if heredoc:
                    out.append(l)
                    if s == heredoc:
                        heredoc = None
                    continue
                mh = re.search(r"<<-?\s*['\"]?(\w+)['\"]?", l)
                if mh:
                    heredoc = mh.group(1)
                if not s or s.startswith('#'):
                    out.append(l)
                    continue
                if re.search(r'\.cmd\b|\.bat\b|^\.\\|PowerShell|\$env:', s):
                    out.append('# (omitido: Windows) ' + l)
                    continue
                for ext in EXTERNAS:
                    if re.search(r'(^|[\s;&|(=])' + re.escape(ext) + r'(\s|$)', s):
                        problemas.append('requiere `%s` (fuera del kit JVM)' % ext.strip())
                if re.search(r'(^|[\s;&|(])(mvn|\./mvnw)(\s|$)', s):
                    kinds.add('maven')
                if re.search(r'(^|[\s;&|(])(gradle|\./gradlew)(\s|$)', s):
                    kinds.add('gradle')
                if re.search(r'(^|[\s;&|(])(java|javac|javap|jar|jdeps|jlink|jdeprscan|jfr)(\s|$)', s):
                    kinds.add('javac')
                if re.search(r'(^|[\s;&|(])\./scripts/', s):
                    kinds.add('script')
                l2 = re.sub(r'(^|[\s;&|(])mkdir\s+(?!-p)', r'\1mkdir -p ', l)
                cdline, sim = self.simular(l2, sim, esp, anticipados)
                if cdline:
                    out.append(cdline)
                if self.es_servidor(s, esp):
                    n_srv += 1
                    l2 = '{ %s ; } > "$SRVDIR/srv-%d.log" 2>&1 &\n__esperar "$SRVDIR/srv-%d.log" $!' % (
                        s.rstrip('&').strip(), n_srv, n_srv)
                elif re.search(r'(^|\s)curl\s', s) and n_srv == 0 and not re.search(r'examples|localhost:\d+', '') :
                    pass
                out.append(l2)
            out.append('')
        if anticipados and not any(r.endswith('.java') for r in esp.archivos if r in self._escritos_seccion):
            problemas.append('comando anticipado: `%s` se crea más adelante en la lección' % anticipados[0])
        if any(re.search(r'(^|\s)curl\s', x) for x in out) and n_srv == 0:
            problemas.append('las peticiones HTTP necesitan un servidor que la lección arranca fuera de los comandos')
        self._sim_final = sim
        return '\n'.join(out) + '\n', kinds, problemas

    def simular(self, linea, sim, esp, anticipados):
        """Sigue la carpeta actual del guion; si javac/java citan fuentes que no están ahí pero sí en otra
        carpeta del espacio de trabajo (la lección dio la ruta desde otra raíz), antepone el cd necesario."""
        prefijo = ''
        for seg in re.split(r'\s*(?:&&|;|\|\|)\s*', linea.strip()):
            mcp = re.match(r'^cp\s+(?:-\w+\s+)*(\S+)\s+(\S+)$', seg)
            if mcp:
                src, dst = unir(sim, mcp.group(1)), unir(sim, mcp.group(2))
                if mcp.group(2).endswith('/') or not os.path.splitext(dst)[1]:
                    dst_f = unir(dst, os.path.basename(src))
                else:
                    dst_f = dst
                esp.virtuales.add(dst_f)
                esp.virtuales.add(dst)  # directorio copiado completo (cp -R)
                continue
            m = re.match(r'^cd\s+([^\s]+)$', seg)
            if m:
                d = m.group(1).strip('"\'')
                if '$' in d or d in ('-', '~'):
                    continue
                sim = norm(os.path.join(sim, d)) if not d.startswith('/') else sim
                continue
            m = re.match(r'^(?:\S+=\S+\s+)*(javac|java)\s+(.*)$', seg)
            if not m:
                continue
            refs = [t for t in m.group(2).split() if t.endswith('.java') and not t.startswith('-') and '*' not in t
                    and '$' not in t]
            def existe(r):
                return r in esp.archivos or r in esp.virtuales or any(r.startswith(v + '/') for v in esp.virtuales)
            if not refs or all(existe(unir(sim, t)) for t in refs):
                continue
            comunes = None
            for t in refs:
                pref = {r[:-len(t)].rstrip('/') for r in esp.archivos if r == t or r.endswith('/' + t)}
                comunes = pref if comunes is None else comunes & pref
            if comunes and len(comunes) == 1:
                destino = comunes.pop()
                prefijo = 'cd "$KIT_WS"%s' % ('/' + sh_q(destino) if destino else '')
                sim = destino
            else:
                anticipados.extend(t for t in refs if not any(r == unir(sim, t) or r.endswith('/' + t)
                                                              for r in esp.archivos))
            break
        return prefijo, sim

    def es_servidor(self, s, esp):
        if re.search(r'spring-boot:run|\bbootRun\b|\bjava\s+(-[\w.:=-]+\s+)*-jar\s', s):
            return True
        m = re.match(r'^(?:\S+=\S+\s+)*java\s+(.*)$', s)
        if not m:
            return False
        toks = m.group(1).split()
        clase = None
        k = 0
        while k < len(toks):
            t = toks[k]
            if t in ('-cp', '-classpath', '--class-path', '-p', '--module-path', '--add-modules', '-m', '--module'):
                if t in ('-m', '--module'):
                    clase = toks[k + 1] if k + 1 < len(toks) else None
                    break
                k += 2
                continue
            if t.startswith('-'):
                k += 1
                continue
            clase = t
            break
        if not clase:
            return False
        nombre = clase.split('/')[-1]
        nombre = nombre[:-5] if nombre.endswith('.java') else nombre.split('.')[-1]
        for r, t in esp.archivos.items():
            if os.path.basename(r) == nombre + '.java' and SERVIDOR_FUENTE.search(t):
                return True
        return False

    def guion_auto(self, esp, escritos, curso):
        java = [r for r in escritos if r.endswith('.java')]
        if not java:
            return '', None
        out = []
        principal = None
        for r in java:
            t = esp.archivos[r]
            ok, porque = es_completo(t)
            if porque == 'compacto':
                out.append('java %s' % sh_q(r))
                continue
            c = clase_main(t)
            if c and not principal:
                principal = (r, c, paquete(t))
        if any('/src/main/java/' in '/' + r or '/src/test/java/' in '/' + r for r in java):
            return '', ('programa dentro de un proyecto Maven sin comando en la lección; '
                        'se compila en la unidad que ejecuta Maven')
        lista = ' '.join(sh_q(r) for r in java if not es_completo(esp.archivos[r])[1] == 'compacto')
        if lista:
            out.insert(0, 'javac -d .kit-out %s' % lista)
            if principal:
                fq = (principal[2] + '.' if principal[2] else '') + principal[1]
                out.append('java -cp .kit-out %s' % fq)
        srv = principal and SERVIDOR_FUENTE.search(esp.archivos[principal[0]])
        if srv and principal:
            fq = (principal[2] + '.' if principal[2] else '') + principal[1]
            out = out[:1] + ['{ java -cp .kit-out %s ; } > "$SRVDIR/srv-1.log" 2>&1 &' % fq,
                             '__esperar "$SRVDIR/srv-1.log" $!', 'sleep 3']
        return '\n'.join(out) + '\n', None

    def cabecera(self, info):
        return ('#!/usr/bin/env bash\n'
                '# Unidad %s — %s (JDK %d)\n'
                '# Generado por verificacion/jvm/extraer.py; se ejecuta desde la raíz del espacio de trabajo.\n'
                ': "${PASOS_RC:=.pasos-rc}" "${SRVDIR:=.}"\n'
                ': > "$PASOS_RC"\n'
                'trap \'echo "$? $BASH_COMMAND" >> "$PASOS_RC"\' ERR\n'
                '__esperar() { local i; for ((i=0;i<${ESPERA_SERVIDOR:-180};i++)); do\n'
                '  grep -Eq "Started [A-Za-z0-9_$]+ in|LISTEN|Tomcat started|Netty started|[Ll]istening|Escuchando|'
                'BUILD FAILURE|Exception in thread|APPLICATION FAILED|Address already in use|Error:|error:" "$1" 2>/dev/null && { sleep 1; return 0; }\n'
                '  [ -n "${2:-}" ] && ! kill -0 "$2" 2>/dev/null && return 0\n'
                '  sleep 1; done; }\n'
                'KIT_WS="$PWD"\n\n' % (info['id'], info['origen'], info['jdk']))

    def pie(self):
        return ('\ntrap - ERR\nsleep 1\nfor __f in "$SRVDIR"/srv-*.log; do [ -f "$__f" ] && '
                '{ echo "--- salida de proceso en segundo plano: $(basename "$__f")"; cat "$__f"; }; done\n'
                'exit 0\n')

    # ------------------------------------------------------------------ esperado / fallo
    def esperado(self, lineas, ini, fin, codigo, grupos_cmd):
        grupos = []
        lineas_exactas = []
        textos = []
        i = ini
        while i < fin:
            l = lineas[i]
            m = re.match(r'^\s*\*\*(Resultado esperado|Salida esperada)[^*]*\*\*\s*:?\s*(.*)', l)
            if m:
                cuerpo = re.split(r'\*\*(?:Fallo|Error|Diagn)', m.group(2))[0]
                textos.append(cuerpo)
                g = fragmentos(cuerpo, codigo)
                grupos += g
                # bloque de texto a continuación (salida exacta)
                k = i + 1
                while k < fin and not lineas[k].strip():
                    k += 1
                if (m.group(2).strip() == '' or m.group(2).rstrip().endswith(':')) and k < fin and \
                        re.match(r'^\s{0,3}```\s*(text|console|plain|output)?\s*$', lineas[k]):
                    j = k + 1
                    while j < fin and not re.match(r'^\s{0,3}```\s*$', lineas[j]):
                        if lineas[j].strip():
                            lineas_exactas.append(lineas[j].rstrip())
                        j += 1
                    i = j
            i += 1
        for g in grupos_cmd:
            for l in g:
                m = re.match(r'^\s*#\s*(?:Esperado|Salida esperada|Resultado esperado)\s*:\s*(.+)$', l)
                if m:
                    for p in re.split(r'\s+(?:\.\.\.|…)\s+', m.group(1)):
                        p = p.strip().strip('`')
                        if len(p) >= 2 and util_como_salida(p, quitar_cadenas(codigo), '\n'.join(cadenas(codigo))):
                            grupos.append([p])
        vistos = []
        for g in grupos:
            if g not in vistos:
                vistos.append(g)
        return {'grupos': vistos, 'lineas': lineas_exactas, 'texto': ' | '.join(textos)[:600],
                'admite_fallo': bool(PALABRAS_FALLO.search(' '.join(textos)))}

    def fallo(self, lineas, ini, fin, codigo, grupos_cmd):
        for i in range(ini, fin):
            l = lineas[i]
            m = re.match(r'^\s*\*\*Fallo deliberado:?\*\*:?\s*(.*)', l)
            if not m:
                continue
            resto = m.group(1)
            partes = re.split(r'\*\*(?:Error esperado|Resultado esperado|Diagnóstico)[^*]*\*\*:?', resto)
            accion = partes[0]
            mm = re.search(r'\*\*Error esperado[^*]*\*\*:?\s*(.*?)(?:\*\*Diagnóstico|$)', resto)
            error = mm.group(1) if mm else ''
            cmds = [c for c in re.findall(r'`([^`]+)`', accion)
                    if re.match(r'(java|javac|javap|jar|jdeps)\s', c)]
            if not cmds:
                continue
            accion_sin = re.sub(r'`[^`]*`', ' ', accion)
            if VERBOS_EDICION.search(accion_sin) or re.search(r'\bterminal\b', accion_sin):
                continue
            return {'linea': i + 1, 'cmds': cmds, 'grupos': fragmentos(error, codigo), 'texto': error[:400]}
        return None

    def unidad_fallo(self, curso, info, fallo, esp):
        uid, d = self.nueva(curso, info['id'].split('-', 1)[1][:40] + '-fallo')
        f = {'id': uid, 'curso': curso, 'origen': '%s:%d' % (info['origen'].rsplit(':', 1)[0], fallo['linea']),
             'jdk': info['jdk'], 'ws': info['ws'], 'tipo': 'fallo', 'titulo': 'Fallo deliberado de ' + info['id'],
             'kinds': info['kinds'], 'archivos': [], 'motivo_skip': '',
             'esperado': {'grupos': fallo['grupos'], 'lineas': [], 'texto': fallo['texto'], 'fallo': True}}
        carpeta = ''
        m = re.match(r'mkdir -p (\S+) && cd', open(os.path.join(self.out, curso, info['id'], 'pasos.sh')).read().split('\n\n', 1)[1])
        if m:
            carpeta = 'mkdir -p %s && cd %s\n' % (m.group(1), m.group(1))
        guion = carpeta + '\n'.join(fallo['cmds']) + '\necho "__rc=$?"\n'
        escribir(os.path.join(d, 'pasos.sh'), self.cabecera(f).replace("trap 'echo", "# trap 'echo") + guion + self.pie(), True)
        escribir(os.path.join(d, 'esperado.json'), json.dumps(f['esperado'], ensure_ascii=False, indent=1))
        escribir(os.path.join(d, 'origen.txt'), '%s\nJDK %d\ntipo: fallo deliberado (se espera que falle)\n'
                 'espacio: %s\ncomandos: %s\n' % (f['origen'], f['jdk'], f['ws'], ' ; '.join(fallo['cmds'])))
        self.unidades.append(f)

    # ------------------------------------------------------------------ extractos de laboratorios
    def extracto(self, info, d, code, ruta, lab, a, rel):
        uid, dd = self.nueva(info['curso'], re.sub(r'^\d+-', '', info['id'])[:36] + '-extracto')
        cands = []
        if ruta:
            ruta = norm(ruta)
            if ruta.startswith('examples/'):
                cands = [ruta]
            elif lab:
                cands = [unir(lab, ruta)]
            if not os.path.exists(os.path.join(REPO, cands[0])) if cands else True:
                base = os.path.basename(ruta)
                cands = [os.path.relpath(os.path.join(r, base), REPO)
                         for r, _, fs in os.walk(os.path.join(REPO, (lab or 'examples'))) if base in fs]
        else:
            cands = [lab]
        e = {'id': uid, 'curso': info['curso'], 'origen': '%s:%d' % (rel, a + 1), 'jdk': info['jdk'], 'ws': '-',
             'tipo': 'extracto', 'titulo': 'Extracto de laboratorio', 'kinds': [], 'archivos': [],
             'candidatos': cands, 'ruta': ruta, 'motivo_skip': '', 'esperado': {}}
        if not cands:
            e['motivo_skip'] = 'la lección cita `%s`, que no existe en examples/ (la lección pide crearlo)' % ruta
        escribir(os.path.join(dd, 'extracto.java'), code + '\n')
        escribir(os.path.join(dd, 'origen.txt'), '%s\ntipo: extracto de laboratorio (se compara con el archivo real)\n'
                 'archivo: %s\n' % (e['origen'], ', '.join(cands) if cands else '(no existe)'))
        escribir(os.path.join(dd, 'extracto.json'), json.dumps({'candidatos': cands, 'ruta': ruta}, ensure_ascii=False))
        if e['motivo_skip']:
            escribir(os.path.join(dd, 'skip.txt'), e['motivo_skip'] + '\n')
        self.unidades.append(e)

    # ------------------------------------------------------------------ laboratorios
    def laboratorios(self):
        ex = os.path.join(REPO, 'examples')
        raices = []
        for r, ds, fs in os.walk(ex):
            ds[:] = [x for x in ds if x not in ('node_modules', 'target', 'build', '.gradle', '.git', 'src')]
            rel = os.path.relpath(r, REPO)
            if EXCLUIR_LABS.search(rel):
                continue
            tiene_pom = 'pom.xml' in fs
            tiene_gradle = 'build.gradle' in fs or 'build.gradle.kts' in fs
            if not (tiene_pom or tiene_gradle):
                continue
            # los submódulos se verifican desde su proyecto padre
            padre = os.path.dirname(r)
            if os.path.exists(os.path.join(padre, 'pom.xml')) and tiene_pom and \
                    re.search(r'<module>%s</module>' % re.escape(os.path.basename(r)), leer(os.path.join(padre, 'pom.xml'))):
                tiene_pom = False
            if any(os.path.exists(os.path.join(padre, x)) for x in ('settings.gradle', 'settings.gradle.kts')) and tiene_gradle \
                    and os.path.basename(r) in leer(next(os.path.join(padre, x) for x in ('settings.gradle', 'settings.gradle.kts')
                                                         if os.path.exists(os.path.join(padre, x)))):
                tiene_gradle = False
            if tiene_pom:
                raices.append((rel, 'maven'))
            if tiene_gradle:
                raices.append((rel, 'gradle'))
        for rel, tool in sorted(raices):
            r = os.path.join(REPO, rel)
            jdk = 25
            if tool == 'maven':
                t = leer(os.path.join(r, 'pom.xml'))
                m = re.search(r'<(?:java\.version|maven\.compiler\.release|release)>(\d+)<', t)
                jdk = int(m.group(1)) if m else 25
                cmd = './mvnw verify' if os.path.exists(os.path.join(r, 'mvnw')) else 'mvn verify'
                origen = rel + '/pom.xml:1'
            else:
                bf = 'build.gradle' if os.path.exists(os.path.join(r, 'build.gradle')) else 'build.gradle.kts'
                t = leer(os.path.join(r, bf))
                m = re.search(r'JavaLanguageVersion\.of\((\d+)\)', t)
                jdk = int(m.group(1)) if m else 25
                cmd = './gradlew test' if os.path.exists(os.path.join(r, 'gradlew')) else 'gradle test'
                origen = rel + '/' + bf + ':1'
            uid, d = self.nueva('examples', slug(rel.replace('examples/', ''), 50) + '-' + tool)
            info = {'id': uid, 'curso': 'examples', 'origen': origen, 'jdk': max(jdk, 21), 'ws': '-', 'tipo': 'lab',
                    'kinds': [tool], 'lab': rel, 'cmd': cmd, 'archivos': [], 'motivo_skip': '', 'esperado': {}}
            escribir(os.path.join(d, 'origen.txt'), '%s\nJDK %d\ntipo: laboratorio %s\ncomando: (cd %s && %s)\n' % (
                origen, info['jdk'], tool, rel, cmd))
            self.unidades.append(info)

    def guardar(self):
        filas = ['id\tcurso\torigen\tjdk\ttipo\tws\tkinds\tdir\tskip\tlab\tcmd']
        for u in self.unidades:
            filas.append('\t'.join(str(x) for x in [
                u['id'], u['curso'], u['origen'], u['jdk'], u['tipo'], u['ws'], '+'.join(u.get('kinds', [])) or '-',
                os.path.join(u['curso'], u['id']), u.get('motivo_skip', '').replace('\t', ' ') or '-',
                u.get('lab', '-') if u['tipo'] == 'lab' else '-', u.get('cmd', '-')]))
        escribir(os.path.join(self.out, 'unidades.tsv'), '\n'.join(filas) + '\n')


def sh_q(s):
    return s if re.fullmatch(r'[\w./@%+=:,-]+', s) else "'" + s.replace("'", "'\\''") + "'"


# ----------------------------------------------------------------------------- comparación (run.sh)
def comparar(unidad, log, es_fallo=False):
    esperado = json.load(open(os.path.join(unidad, 'esperado.json'), encoding='utf-8'))
    salida = open(log, encoding='utf-8', errors='replace').read()
    rcfile = os.environ.get('PASOS_RC_FILE')
    errores = []
    if rcfile and os.path.exists(rcfile):
        errores = [l for l in open(rcfile, encoding='utf-8', errors='replace').read().split('\n') if l.strip()]
    grupos = esperado.get('grupos', [])
    exactas = esperado.get('lineas', [])
    faltan = []
    for g in grupos:
        if not any(re.search(patron(alt), salida, re.S) for alt in g):
            faltan.append(' o '.join('«%s»' % x for x in g))
    lin_sal = [x.rstrip() for x in salida.split('\n')]
    for l in exactas:
        rx = re.compile(r'^\s*' + patron(l.strip()) + r'\s*$')
        if not any(rx.match(x) for x in lin_sal):
            faltan.append('línea «%s»' % l.strip())
    compil = [e for e in errores if re.search(r'\b(javac|mvn|mvnw|gradle|gradlew)\b', e)]
    marca = re.search(r'BUILD FAILURE|BUILD FAILED|APPLICATION FAILED TO START|COMPILATION ERROR|'
                      r'Tests run: \d+, Failures: [1-9]|Tests run: \d+, Failures: \d+, Errors: [1-9]', salida)
    if marca and not es_fallo and not esperado.get('admite_fallo'):
        compil = compil or ['%s (ver log)' % marca.group(0)]
    if es_fallo:
        rc = re.findall(r'__rc=(\d+)', salida)
        fallo_ok = (rc and rc[-1] != '0') or re.search(r'error:|Exception|Error:|ERROR', salida)
        if faltan:
            return 'FAIL', 'el fallo deliberado no muestra lo prometido: ' + '; '.join(faltan[:4])
        if not grupos and not fallo_ok:
            return 'FAIL', 'el fallo deliberado terminó sin error'
        return 'PASS', 'falla como promete la lección' + (' (%d comprobaciones)' % len(grupos) if grupos else '')
    if faltan:
        det = 'falta en la salida: ' + '; '.join(faltan[:4])
        if compil:
            det += ' | comando con error: ' + compil[0][:160]
        return 'FAIL', det
    if compil and not esperado.get('admite_fallo'):
        return 'FAIL', 'comando con error: ' + compil[0][:200]
    if errores and not esperado.get('admite_fallo') and not grupos and not exactas:
        return 'FAIL', 'comando con error: ' + errores[0][:200]
    n = len(grupos) + len(exactas)
    if n:
        return 'PASS', 'salida coincide con el resultado esperado (%d comprobaciones)' % n
    return 'PASS', 'compila y ejecuta sin error (la lección no da salida literal comparable)'


PALABRAS_JAVA = set('''abstract assert boolean break byte case catch char class const continue default do double else
enum extends final finally float for goto if implements import instanceof int interface long native new package private
protected public return short static strictfp super switch synchronized this throw throws transient try void volatile
while var record sealed permits yield true false null non'''.split())


def quitar_comentarios(t):
    t = re.sub(r'/\*[\s\S]*?\*/', ' ', t)
    return re.sub(r'//[^\n]*', ' ', t)


def comparar_extracto(unidad):
    info = json.load(open(os.path.join(unidad, 'extracto.json'), encoding='utf-8'))
    code = open(os.path.join(unidad, 'extracto.java'), encoding='utf-8').read()
    def lineas(t):
        res = []
        for l in t.split('\n'):
            s = re.sub(r'\s+', ' ', l.strip())
            if not s or re.fullmatch(r'(//.*|\.\.\.|…|/\*.*\*/|\*.*|[{}();]+)', s):
                continue
            res.append(s)
        return res
    req = lineas(code)
    ids_req = {i for i in re.findall(r'[A-Za-z_]\w*', quitar_comentarios(quitar_cadenas(code)))
               if len(i) > 2} - PALABRAS_JAVA
    if not req:
        return 'SKIP', 'extracto vacío'
    mejor = None
    for c in info['candidatos']:
        p = os.path.join(REPO, c)
        archivos = []
        if os.path.isdir(p):
            for r, ds, fs in os.walk(p):
                ds[:] = [x for x in ds if x not in ('target', 'build', 'node_modules', '.gradle')]
                archivos += [os.path.join(r, f) for f in fs if f.endswith(('.java', '.kt'))]
        elif os.path.exists(p):
            archivos = [p]
        for a in archivos:
            txt = open(a, encoding='utf-8', errors='replace').read()
            disp = ' '.join(lineas(txt))
            falt = [x for x in req if x not in disp]
            ids_arch = set(re.findall(r'[A-Za-z_]\w*', quitar_comentarios(txt)))
            ids_falt = sorted(i for i in ids_req if i not in ids_arch)
            if mejor is None or (len(ids_falt), len(falt)) < (len(mejor[2]), len(mejor[1])):
                mejor = (os.path.relpath(a, REPO), falt, ids_falt)
            if not falt:
                return 'PASS', 'extracto idéntico a %s' % os.path.relpath(a, REPO)
    if mejor is not None and not mejor[2]:
        return 'PASS', ('extracto equivalente a %s (mismos identificadores; difiere en formato o simplifica %d líneas)'
                        % (mejor[0], len(mejor[1])))
    if mejor is None:
        return 'SKIP', 'no se encontró el archivo citado'
    if info.get('ruta') is None:
        return 'SKIP', 'fragmento sin archivo; el más parecido (%s) difiere en %d líneas' % (mejor[0], len(mejor[1]))
    return 'FAIL', 'el extracto no coincide con %s; identificadores ausentes en el archivo: %s; líneas: %s' % (
        mejor[0], ', '.join(mejor[2][:8]), ' | '.join(mejor[1][:2]))


# ----------------------------------------------------------------------------- ejecución con timeout
def ejecutar(seg, log, cwd, cmd):
    with open(log, 'ab') as f:
        try:
            p = subprocess.Popen(cmd, cwd=cwd, stdout=f, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                 start_new_session=True)
        except OSError as e:
            f.write(('no se pudo ejecutar: %s\n' % e).encode())
            return 127
        try:
            rc = p.wait(timeout=seg)
        except subprocess.TimeoutExpired:
            f.write(('\n[kit] TIMEOUT tras %d s\n' % seg).encode())
            rc = 124
        try:
            os.killpg(p.pid, signal.SIGTERM)
            time.sleep(1)
            os.killpg(p.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
        return rc


def main():
    a = sys.argv[1:]
    if a and a[0] == '--comparar':
        unidad, log = a[1], a[2]
        if os.path.exists(os.path.join(unidad, 'extracto.json')):
            r, d = comparar_extracto(unidad)
        else:
            r, d = comparar(unidad, log, '--fallo' in a)
        print('%s\t%s' % (r, d.replace('\t', ' ').replace('\n', ' ')))
        return 0
    if a and a[0] == '--ejecutar':
        seg, log, cwd = int(a[1]), a[2], a[3]
        cmd = a[a.index('--') + 1:]
        return ejecutar(seg, log, cwd, cmd)
    out = os.path.join(KIT, 'build')
    if '--out' in a:
        out = os.path.abspath(a[a.index('--out') + 1])
    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out)
    ex = Extractor(out)
    for c in CURSOS:
        ex.curso(c)
    ex.laboratorios()
    ex.guardar()
    tot = len(ex.unidades)
    skip = sum(1 for u in ex.unidades if u.get('motivo_skip'))
    por = {}
    for u in ex.unidades:
        por.setdefault(u['tipo'], 0)
        por[u['tipo']] += 1
    print('unidades: %d (SKIP ya en extracción: %d) %s -> %s' % (tot, skip, por, out))
    return 0


if __name__ == '__main__':
    sys.exit(main())
