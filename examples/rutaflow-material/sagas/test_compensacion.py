import sqlite3
import tempfile
from pathlib import Path
import unittest
from compensacion import iniciar, compensar

class CompensacionTest(unittest.TestCase):
    def test_reinicio_y_reintento_no_duplican_efecto(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'saga.db'
            with sqlite3.connect(path) as db:
                iniciar(db)
                with self.assertRaises(ConnectionError): compensar(db, falla=True)
                self.assertEqual('PENDIENTE', db.execute('SELECT estado FROM compensaciones').fetchone()[0])
            with sqlite3.connect(path) as db:
                compensar(db)
                compensar(db)
                self.assertEqual(10, db.execute('SELECT cantidad FROM stock').fetchone()[0])
                self.assertEqual('HECHA', db.execute('SELECT estado FROM compensaciones').fetchone()[0])
if __name__=='__main__':unittest.main()
