import {
  Activity, Apple, Atom, BookOpen, Braces, ChevronDown, ChevronRight, Circle, CircleCheck, CloudCog, Coffee,
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
};

export const SHARED_ICONS = {
  ChevronDown, ChevronRight, Circle, CircleCheck, Command, Search, X,
};

/** Marcas tipográficas compactas y accesibles. Complementan a Lucide con una
 * identidad reconocible sin depender de fuentes de iconos o CDN externos. */
export const TRACK_MARKS: Record<string, string> = {
  rutaflow: 'RF', foundations: '</>', cloud: '☁', devops: '∞', javascript: 'JS',
  node: '⬢', angular: 'A', react: '⚛', java: 'J', 'spring-boot': 'S', microservices: 'µS',
  'kotlin-multiplatform': 'K', android: 'A', ios: '', flutter: 'F', 'control-1': 'Σ',
};
