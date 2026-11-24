import { CourseModule, createModule as m } from '../course-module.model';

export const GIT_MODULES: CourseModule[] = [
  m(0, 'Git avanzado y estrategias de branching', 'Git avanzado', 'Fundamentos', '2 h 30 min', '#475569',
    'Más allá de add/commit/push: history rewriting, branching a escala de equipo y resolución de conflictos sin miedo.',
    ['Trunk-based development vs GitFlow', 'Rebase interactivo vs merge', 'Bisect para encontrar regresiones', 'Hooks de Git y commits firmados', 'Monorepos vs polyrepos', 'git cherry-pick, git stash, git reset vs git revert', 'git reflog, git worktree y git submodule'],
    [
      'Crea 3 commits desordenados y límpialos en uno solo con git rebase -i',
      'Provoca un conflicto de merge intencional entre dos ramas y resuélvelo manualmente',
      'Usa git bisect para encontrar el commit exacto que introdujo un bug en un repositorio con varios commits',
      'Configura un pre-commit hook que bloquee un commit si el código no pasa el linter',
      'Documenta en una página la diferencia entre trunk-based development y GitFlow, y cuál usarías para un equipo de 5 personas',
    ],
    ['¿Por qué rebase produce un historial más limpio que merge, y qué riesgo tiene en ramas compartidas?', '¿Qué problema resuelve git bisect que revisar commits uno por uno no resuelve eficientemente?'],
    ['Git'],
    'Repositorio con historial limpio usando rebase y una estrategia de branching documentada.'),
];
