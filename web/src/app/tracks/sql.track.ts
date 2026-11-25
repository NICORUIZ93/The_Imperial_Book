import { CourseModule, createModule as m } from '../course-module.model';

export const SQL_MODULES: CourseModule[] = [
  m(0, 'Modelado de datos, SQL y persistencia', 'Datos y SQL', 'Aplicación', '10 h', '#6d5dfc',
    'Pasa de archivos de texto a una base relacional: modela entidades y relaciones, consulta con SQL, protege integridad con transacciones y compara responsablemente SQL con NoSQL.',[
      'Del mundo real al modelo relacional',
      'SQL para definir, escribir, consultar y relacionar',
      'Índices, restricciones y planes de consulta',
      'Transacciones, concurrencia y elección SQL/NoSQL',
      'SQL avanzado: subconsultas, vistas, triggers y funciones de ventana',
      'Procedimientos almacenados, funciones y cursores con PL/pgSQL',
      'De SQL a Excel: reportes con tablas y fórmulas vivas'
    ],
    [
      'Diseña un modelo entidad-relación para inventario y movimientos',
      'Crea el esquema SQLite desde un archivo de migración',
      'Implementa consultas parametrizadas y reportes con JOIN',
      'Demuestra rollback, restricciones e impacto de un índice',
    ],
    [
      '¿Qué diferencia hay entre clave primaria y foránea?',
      '¿Por qué un índice mejora lecturas pero tiene un coste?',
      '¿Qué garantiza una transacción que varias sentencias aisladas no garantizan?',
    ],
    ['SQLite', 'SQL', 'Java 25', 'JDBC'],
    'Sistema de inventario persistente con esquema versionado, consultas seguras, transacciones, reportes y análisis SQL/NoSQL.'),
];
