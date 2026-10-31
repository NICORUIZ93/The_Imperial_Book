"""Prueba real en un clúster PostgreSQL temporal; nunca usa bases existentes."""
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / "examples/rutaflow/database/backup_verified.sh"
REQUIRED = ("initdb", "pg_ctl", "psql", "pg_dump", "pg_restore", "createdb", "dropdb")


@unittest.skipUnless(os.name == "posix" and all(shutil.which(tool) for tool in REQUIRED),
                     "Requiere herramientas PostgreSQL en PATH y un sistema POSIX")
class BackupVerificationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="floci-pg-", dir="/tmp")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        socket = self.root / "socket"
        socket.mkdir()
        # PostgreSQL en macOS aborta al arrancar si el locale heredado no resuelve.
        self.env = {**os.environ, "LC_ALL": "C", "PGHOST": str(socket), "PGPORT": "55479",
                    "PGUSER": "floci_lab", "PGDATABASE": "postgres",
                    "DATABASE_URL": "postgresql:///source_lab"}
        for key in ("PGSERVICE", "PGSERVICEFILE", "PGHOSTADDR", "PGOPTIONS"):
            self.env.pop(key, None)
        self.data = self.root / "data"
        self.run_command("initdb", "-D", str(self.data), "-U", "floci_lab", "-A", "trust", "--no-locale")
        self.run_command("pg_ctl", "-D", str(self.data), "-l", str(self.root / "server.log"),
                         "-o", f"-k {socket} -p 55479 -c listen_addresses=''", "-w", "start")
        self.addCleanup(self.run_command, "pg_ctl", "-D", str(self.data), "-m", "fast", "-w", "stop")
        self.run_command("createdb", "source_lab")
        self.run_command("psql", "-v", "ON_ERROR_STOP=1", "source_lab", "-c", """
            CREATE TABLE envios(id bigserial primary key, codigo text unique, estado text);
            CREATE TABLE envio_eventos(id bigserial primary key, envio_id bigint references envios(id), tipo text);
            CREATE FUNCTION no_edit() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN RAISE EXCEPTION 'inmutable'; END; $$;
            CREATE TRIGGER immutable_events BEFORE UPDATE OR DELETE ON envio_eventos
                FOR EACH ROW EXECUTE FUNCTION no_edit();
            INSERT INTO envios(codigo,estado) VALUES ('RF-1','creado'),('RF-2','entregado');
            INSERT INTO envio_eventos(envio_id,tipo) VALUES (1,'creado'),(2,'entregado');
        """)

    def run_command(self, *args):
        return subprocess.run(args, env=self.env, cwd=self.root, text=True,
                              capture_output=True, check=True)

    def backup(self, env=None):
        return subprocess.run(["bash", str(SCRIPT), "backup.dump"], env=env or self.env,
                              cwd=self.root, text=True, capture_output=True)

    def assert_no_restore_database(self):
        result = self.run_command("psql", "-At", "-c",
                                 "SELECT count(*) FROM pg_database WHERE datname LIKE 'rutaflow_verify_%'")
        self.assertEqual(result.stdout.strip(), "0")

    def override_restore(self, body):
        directory = self.root / "bin"
        directory.mkdir()
        wrapper = directory / "pg_restore"
        wrapper.write_text("#!/usr/bin/env bash\nset -e\n" + body)
        wrapper.chmod(0o755)
        return {**self.env, "PATH": str(directory) + os.pathsep + self.env["PATH"]}

    def test_restore_preserves_data_and_dependencies(self):
        result = self.backup()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("restaurados y comparados", result.stdout)
        self.assertGreater((self.root / "backup.dump").stat().st_size, 0)
        self.assert_no_restore_database()

    def test_existing_backup_is_not_overwritten(self):
        artifact = self.root / "backup.dump"
        artifact.write_bytes(b"respaldo previo")
        result = self.backup()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(artifact.read_bytes(), b"respaldo previo")
        self.assert_no_restore_database()

    def test_failed_restore_cleans_up_and_returns_failure(self):
        result = self.backup(self.override_restore("exit 19\n"))
        self.assertNotEqual(result.returncode, 0)
        self.assert_no_restore_database()

    def test_changed_content_with_equal_row_count_is_rejected(self):
        import shlex
        command = shlex.quote(shutil.which("pg_restore"))
        body = command + ' "$@"\n' + """
for arg in "$@"; do
  case "$arg" in --dbname=*) db="${arg#--dbname=}";; esac
done
psql -v ON_ERROR_STOP=1 "$db" -c "UPDATE envios SET estado='alterado' WHERE id=1" >/dev/null
"""
        result = self.backup(self.override_restore(body))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("envios difiere", result.stderr)
        self.assert_no_restore_database()
        original = self.run_command("psql", "source_lab", "-At", "-c", "SELECT estado FROM envios WHERE id=1")
        self.assertEqual(original.stdout.strip(), "creado")


if __name__ == "__main__":
    unittest.main()
