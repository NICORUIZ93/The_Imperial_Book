import { CourseModule, createModule as m } from '../course-module.model';

export const IAC_MODULES: CourseModule[] = [
  m(0, 'Infraestructura como código con Terraform', 'Terraform', 'Integración', '3 h 30 min', '#475569',
    'Describe tu infraestructura completa en archivos versionables, con estado y plan de cambios antes de aplicar.',['Providers, resources y data sources', 'State remoto y locking', 'Módulos reutilizables', 'terraform plan vs apply', 'Workspaces para múltiples entornos', 'Ansible — playbooks, roles, inventory y módulos', 'Pulumi como alternativa a HCL', 'OpenTofu, plan y estado sin recursos cloud', 'terraform import y policy as code: adoptar recursos existentes y revisar planes con reglas'],
    [
      'Escribe un archivo .tf que provisione un recurso simple (puede ser contra AWS local) y ejecuta terraform plan antes de aplicar',
      'Aplica el cambio con terraform apply y verifica el recurso creado',
      'Modifica el recurso y observa cómo terraform plan muestra exactamente el diff antes de aplicar',
      'Extrae la definición en un módulo reutilizable con variables de entrada',
      'Configura un backend de estado remoto (o documenta cómo lo harías) para evitar conflictos entre miembros del equipo',
    ],
    ['¿Por qué nunca deberías editar el archivo de estado de Terraform a mano?', '¿Qué problema resuelve el locking del estado remoto cuando trabajas en equipo?'],
    ['Terraform'],
    'Módulo Terraform que provisiona la infraestructura base de un proyecto en un proveedor cloud.'),
];
