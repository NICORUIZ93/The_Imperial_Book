import sys
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from audit_course_depth import signals
from audit_seven_step_methodology import evaluate
from audit_topic_learning_quality import evaluate as editorial

class DepthSignalsTests(unittest.TestCase):
    def test_spread_is_code_not_placeholder(self):
        self.assertNotIn('comprobar-fragmento-incompleto',signals('```javascript\nconst copy = [...items];\n```'))
        self.assertIn('comprobar-fragmento-incompleto',signals('```java\ncrear(...);\n```'))

    def test_shell_example_does_not_require_source_lines(self):
        self.assertNotIn('ejemplo-breve-revisar-contexto',signals('```bash\naws s3 ls\n```'))

    def test_mjs_and_replace_are_legitimate_demo_instructions(self):
        block='#### Paso 4 · Demostración guiada\nReemplaza `pagina.mjs`:\n```javascript\nexport const pagina = [];\n```'
        self.assertTrue(evaluate(block)['guidedDemo'])

    def test_swift_compiler_is_execution(self):
        self.assertTrue(editorial('```bash\nswiftc Demo.swift -o demo\n```')['runCommand'])

if __name__=='__main__':unittest.main()
