import {
  Activity, Apple, Atom, BookOpen, Braces, Container, Database, FileCode, Gauge, MessagesSquare, ShieldCheck, Ship, Terminal, Workflow, ChevronDown, ChevronRight, Circle, CircleCheck, CloudCog, Coffee,
  Command, GitBranch, Layers, Leaf, LucideIconData, Network, Search, Server, Shield, Smartphone, Truck, Wind, X,
} from 'lucide-angular';

/** Mapea el campo string `Track.icon` a su icono lucide-angular, para mantener
 *  los archivos de datos (tracks/*.track.ts) libres de imports de UI. */
export const TRACK_ICONS: Record<string, LucideIconData> = {
  'book-open': BookOpen,
  'cloud-cog': CloudCog,
  'git-branch': GitBranch,
  'braces': Braces,
  'server': Server,
  'shield': Shield,
  'atom': Atom,
  'coffee': Coffee,
  'leaf': Leaf,
  'network': Network,
  'layers': Layers,
  'smartphone': Smartphone,
  'apple': Apple,
  'wind': Wind,
  'truck': Truck,
  'activity': Activity,
  'terminal': Terminal,
  'database': Database,
  'shield-check': ShieldCheck,
  'container': Container,
  'ship': Ship,
  'workflow': Workflow,
  'file-code': FileCode,
  'gauge': Gauge,
  'messages': MessagesSquare,
};

export const SHARED_ICONS = {
  ChevronDown, ChevronRight, Circle, CircleCheck, Command, Search, X,
};

/** Marcas tipográficas compactas y accesibles. Complementan a Lucide con una
 * identidad reconocible sin depender de fuentes de iconos o CDN externos. */
export const TRACK_MARKS: Record<string, string> = {
  'foundations': '</>',
  'git': 'git',
  'linux': '>_',
  'sql': 'DB',
  'java': 'J',
  'javascript': 'JS',
  'typescript': 'TS',
  'kotlin': 'Kt',
  'spring-boot': 'S',
  'node': '⬢',
  'angular': 'A',
  'react': '⚛',
  'flutter': 'F',
  'android': 'A',
  'ios': '',
  'kotlin-multiplatform': 'K',
  'arquitectura': '⌗',
  'seguridad': '🔒',
  'mensajeria': '✉',
  'microservicios': 'µ',
  'docker': 'D',
  'kubernetes': 'K8s',
  'cicd': '↻',
  'iac': 'IaC',
  'observabilidad': '◔',
  'cloud': '☁',
  'control-1': 'Σ',
};
