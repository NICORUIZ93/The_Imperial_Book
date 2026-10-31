import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import audit_topic_learning_quality as audit
import audit_code_visual_quality as visual_audit
import fix_lessons


class EditorialValidationTests(unittest.TestCase):
    def test_every_required_criterion_is_mandatory(self):
        criteria = dict.fromkeys(audit.evaluate(""), True)
        self.assertTrue(audit.classify(criteria, "contenido específico")["practicable"])
        for key in criteria:
            if key == "visual":
                continue
            with self.subTest(criterion=key):
                self.assertFalse(audit.classify({**criteria, key: False}, "")["practicable"])
        self.assertFalse(audit.classify(criteria, "passed: true")["practicable"])

    def test_hidden_scaffold_cannot_supply_project_or_limits(self):
        markdown = """### Tema 1: Ejemplo
Texto propio.
<!-- DEFINITIVE-COMPLEMENTS:START -->
El proyecto integrador tiene límites.
<!-- DEFINITIVE-COMPLEMENTS:END -->
"""
        visible = audit.student_visible_content(markdown)
        _, block = next(audit.topic_blocks(visible))
        self.assertFalse(audit.evaluate(block)["project"])
        self.assertFalse(audit.evaluate(block)["limitsDecision"])

    def test_visual_score_cannot_replace_required_criteria(self):
        criteria = dict.fromkeys(audit.evaluate(""), True)
        criteria["visual"] = False
        self.assertTrue(audit.classify(criteria, "contenido específico")["practicable"])
        criteria.update(visual=True, project=False)
        self.assertFalse(audit.classify(criteria, "contenido específico")["practicable"])

    def test_existing_archify_html_counts_as_visual_but_broken_link_does_not(self):
        with tempfile.TemporaryDirectory() as directory:
            public = Path(directory) / "public"
            visual = public / "visuals/temas/demo.html"
            visual.parent.mkdir(parents=True)
            visual.write_text("<!doctype html>", encoding="utf-8")
            block = "[Diagrama interactivo](/visuals/temas/demo.html)"
            with patch.object(audit, "PUBLIC", public), patch.object(audit, "VISUALS", public / "visuals"):
                self.assertTrue(audit.evaluate(block)["visual"])
                self.assertEqual(audit.unresolved_archify_visual_links(block), [])
                visual.unlink()
                self.assertFalse(audit.evaluate(block)["visual"])
                self.assertEqual(audit.unresolved_archify_visual_links(block), ["/visuals/temas/demo.html"])

    def test_code_visual_report_tracks_existing_archify_html(self):
        with tempfile.TemporaryDirectory() as directory:
            public = Path(directory) / "public"
            visual = public / "visuals/temas/demo.html"
            visual.parent.mkdir(parents=True)
            visual.write_text("<!doctype html>", encoding="utf-8")
            block = "[Diagrama interactivo](/visuals/temas/demo.html)"
            with patch.object(audit, "PUBLIC", public), patch.object(audit, "VISUALS", public / "visuals"):
                self.assertTrue(visual_audit.evaluate(block)["archifyVisual"])

    def test_provider_documentation_is_recognized_by_exact_host(self):
        for host in ("docs.python.org", "docs.oracle.com", "www.typescriptlang.org",
                     "tc39.es", "www.gnu.org", "docs.npmjs.com", "docs.github.com",
                     "sre.google", "www.microsoft.com", "ocw.mit.edu", "cs.brown.edu"):
            with self.subTest(host=host):
                self.assertTrue(visual_audit.evaluate(f"https://{host}/docs")["officialSource"])

    def test_source_host_prefixes_and_userinfo_are_not_accepted(self):
        for url in ("https://angular.dev.evil.example/", "https://docs.python.org.evil.example/",
                    "https://angular.dev@evil.example/", "https://someone@docs.python.org/",
                    "https://github.com/someone/documentation", "https://en.wikipedia.org/wiki/Python"):
            with self.subTest(url=url):
                self.assertFalse(visual_audit.evaluate(url)["officialSource"])

    def test_source_inside_code_or_hidden_complements_is_not_counted(self):
        for block in (
            '```js\nconst url = "https://angular.dev/";\n```',
            '<!-- DEFINITIVE-COMPLEMENTS:START -->\nhttps://docs.python.org/\n<!-- DEFINITIVE-COMPLEMENTS:END -->',
        ):
            with self.subTest(block=block):
                self.assertFalse(visual_audit.evaluate(block)["officialSource"])

    def test_source_review_preserves_pending_applicability(self):
        root = Path(__file__).resolve().parents[2]
        data = json.loads((root / "docs/topic-source-review.json").read_text())
        summary = data["summary"]
        self.assertEqual(summary["baselineUnrecognizedTopics"], len(data["topics"]))
        self.assertEqual(summary["additionalRecognizedTopics"], sum(bool(row["providerCitations"]) for row in data["topics"]))
        self.assertEqual(summary["remainingUnrecognizedTopics"], sum(not row["providerCitations"] for row in data["topics"]))
        self.assertEqual(summary["urlsReachable"], sum(row.get("status") == 200 for row in data["urlChecks"]))
        self.assertEqual(summary["urlsPending"], sum(row.get("status") != 200 for row in data["urlChecks"]))
        self.assertTrue(all(row["applicabilityReview"] == "revisión manual pendiente" for row in data["topics"]))
        self.assertTrue(set(data["providerHostsReviewed"]).issubset(visual_audit.OFFICIAL_SOURCE_HOSTS))

    def test_real_file_types_and_commands_are_recognized(self):
        for filename, command in [("index.html", "python3 -m http.server"),
                                  ("styles.css", "curl localhost:8000"),
                                  ("schema.sql", "psql -f schema.sql"),
                                  ("backup.sql", "pg_dump db"),
                                  ("tareas.py", "git log"),
                                  ("main.tf", "tofu plan")]:
            with self.subTest(filename=filename):
                result = audit.evaluate(f"{filename}\n```bash\n{command}\n```")
                self.assertTrue(result["filePath"])
                self.assertTrue(result["runCommand"])

    def test_regex_patterns_are_not_mistaken_for_damaged_prose(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "example.py"
            path.write_text('import re\npattern = re.compile(r"ya?ml")\nmessage = r"configuraci?n"\n')
            with patch.object(fix_lessons, "iter_text_check_files", return_value=[str(path)]):
                issues = fix_lessons.find_text_quality_issues()
            self.assertEqual([issue[1] for issue in issues], [3])


class DocumentationConsistencyTests(unittest.TestCase):
    def run_checks(self, readme_coverage="1100/1100", report_coverage="1100/1100", expiry=120):
        script = (Path(__file__).resolve().parents[1] / "validate.sh").read_text()
        checks = script.split("const readme =", 1)[1].split("const declaredInventory =", 1)[0]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "README.md").write_text(
                f"registra {readme_coverage} temas con los nueve criterios detectados.\n"
                f"La comprobación vence a los {expiry} días.\n"
            )
            (root / "docs/full-review.md").write_text(
                f"| Criterios editoriales | {report_coverage} temas |\n"
            )
            (root / "docs/official-sources.json").write_text(json.dumps({"maxAgeDays": 120}))
            return subprocess.run(
                ["node", "-e", "const fs = require('fs');\nconst readme =" + checks],
                cwd=root, capture_output=True, text=True,
            )

    def test_matching_documentation_passes(self):
        self.assertEqual(self.run_checks().returncode, 0)

    def test_stale_coverage_is_rejected(self):
        for coverage in ("1099/1100", "1100/1101"):
            with self.subTest(coverage=coverage):
                result = self.run_checks(readme_coverage=coverage)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("README desactualizado vs full-review.md", result.stderr)

    def test_obsolete_coverage_is_rejected_even_if_both_documents_agree(self):
        self.assertNotEqual(self.run_checks("1094/1100", "1094/1100").returncode, 0)

    def test_expiry_mismatch_is_rejected(self):
        result = self.run_checks(expiry=100)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("caducidad", result.stderr)


if __name__ == "__main__":
    unittest.main()
