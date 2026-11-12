export interface ProjectBootstrap {
  workspace: string;
  prerequisites: string[];
  createCommands: string[];
  structure: string[];
  runCommand: string;
  expected: string;
  recovery: string[];
}

const BOOTSTRAPS: Record<string, ProjectBootstrap> = {
  'control-1': {
    workspace: 'academia-labs/control-1',
    prerequisites: ['Python 3', 'Git', 'Visual Studio Code'],
    createCommands: ['mkdir -p academia-labs/control-1/{ejercicios,evidence}', 'cd academia-labs/control-1', 'git init', 'python3 -m venv .venv', 'source .venv/bin/activate  # Windows: .venv\\Scripts\\Activate.ps1', 'python3 -m pip install sympy scipy matplotlib'],
    structure: ['README.md', 'ejercicios/', 'ejercicios/verificar.py', 'evidence/'],
    runCommand: 'python3 ejercicios/verificar.py',
    expected: 'El script imprime cada resultado calculado a mano junto al que da SymPy o SciPy, y ambos coinciden.',
    recovery: ['Si pip no encuentra el paquete, activa primero el entorno .venv.', 'Si un resultado no coincide, revisa primero el signo de los polos y la forma estándar de G(s).'],
  },
  foundations: {
    workspace: 'academia-labs/foundations',
    prerequisites: ['Python 3', 'Git', 'Visual Studio Code'],
    createCommands: ['mkdir -p academia-labs/foundations', 'cd academia-labs/foundations', 'git init', 'python3 -m venv .venv', 'source .venv/bin/activate  # Windows: .venv\\Scripts\\Activate.ps1'],
    structure: ['README.md', 'src/', 'tests/', 'evidence/'],
    runCommand: 'python3 -m unittest discover -s tests -v',
    expected: 'La prueba mínima termina en OK y README registra el comando usado.',
    recovery: ['Si python3 no existe, prueba python o py en Windows.', 'Si no activa el entorno, confirma tu shell y la ruta de .venv.'],
  },
  cloud: {
    workspace: 'academia-labs/cloud',
    prerequisites: ['Docker', 'AWS CLI', 'Terraform u OpenTofu', 'Git'],
    createCommands: ['mkdir -p academia-labs/cloud/{infra,evidence}', 'cd academia-labs/cloud', 'git init', 'docker compose up -d', 'docker compose ps'],
    structure: ['compose.yaml', 'infra/main.tf', 'scripts/', 'evidence/', 'README.md'],
    runCommand: 'terraform -chdir=infra init && terraform -chdir=infra validate',
    expected: 'Floci aparece saludable y Terraform informa que la configuración es válida.',
    recovery: ['Si Docker no conecta, inicia Docker Desktop o el daemon.', 'Si AWS CLI pide credenciales, usa únicamente credenciales locales de prueba.'],
  },
  devops: {
    workspace: 'academia-labs/devops',
    prerequisites: ['Git', 'Docker', 'shell Bash o WSL'],
    createCommands: ['mkdir -p academia-labs/devops/{app,infra,scripts,evidence}', 'cd academia-labs/devops', 'git init', 'touch README.md compose.yaml'],
    structure: ['app/', 'infra/', 'scripts/', 'evidence/', '.github/workflows/', 'README.md'],
    runCommand: 'docker compose config',
    expected: 'Compose imprime la configuración normalizada sin errores.',
    recovery: ['En Windows ejecuta los comandos Linux dentro de WSL.', 'Ante permisos denegados, revisa propietario y permisos; no uses sudo sin diagnóstico.'],
  },
  javascript: {
    workspace: 'academia-labs/javascript',
    prerequisites: ['Node.js LTS', 'npm', 'Git'],
    createCommands: ['npm create vite@latest academia-labs/javascript -- --template vanilla-ts', 'cd academia-labs/javascript', 'npm install', 'git init'],
    structure: ['src/main.ts', 'src/style.css', 'index.html', 'tests/', 'README.md'],
    runCommand: 'npm run dev',
    expected: 'Vite muestra una URL local y el navegador carga la aplicación sin errores de consola.',
    recovery: ['Si npm no existe, reinstala Node LTS y abre otra terminal.', 'Si el puerto está ocupado, usa la URL alternativa que imprime Vite.'],
  },
  node: {
    workspace: 'academia-labs/node-api',
    prerequisites: ['Node.js LTS', 'npm', 'Git'],
    createCommands: ['mkdir -p academia-labs/node-api/src', 'cd academia-labs/node-api', 'npm init -y', 'npm install fastify', 'npm install -D typescript tsx @types/node', 'npx tsc --init'],
    structure: ['src/server.ts', 'src/domain/', 'src/adapters/', 'tests/', '.env.example', 'README.md'],
    runCommand: 'npx tsx src/server.ts',
    expected: 'La terminal informa el puerto y GET /health responde 200.',
    recovery: ['Si ERR_MODULE_NOT_FOUND aparece, ejecuta npm install en la carpeta que contiene package.json.', 'Si EADDRINUSE aparece, identifica el proceso antes de cambiar el puerto.'],
  },
  angular: {
    workspace: 'academia-labs/angular-app',
    prerequisites: ['Node.js LTS', 'npm', 'Angular CLI mediante npx'],
    createCommands: ['npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss', 'cd academia-labs/angular-app', 'git init'],
    structure: ['src/app/', 'src/app/core/', 'src/app/features/', 'src/app/shared/', 'src/app/app.routes.ts'],
    runCommand: 'npm start',
    expected: 'http://localhost:4200 carga la aplicación y la consola no muestra errores.',
    recovery: ['Si ng no existe, usa npx ng version.', 'Si una importación falla, confirma que la ruta sea relativa al archivo actual.'],
  },
  react: {
    workspace: 'academia-labs/react-app',
    prerequisites: ['Node.js LTS', 'npm', 'Git'],
    createCommands: ['npm create vite@latest academia-labs/react-app -- --template react-ts', 'cd academia-labs/react-app', 'npm install', 'git init'],
    structure: ['src/main.tsx', 'src/App.tsx', 'src/features/', 'src/components/', 'src/services/', 'tests/'],
    runCommand: 'npm run dev',
    expected: 'La URL local carga React y no hay errores en consola.',
    recovery: ['Si la pantalla queda blanca, revisa el primer error de la consola.', 'Si un componente no actualiza, verifica props, estado y key antes de añadir efectos.'],
  },
  java: {
    workspace: 'academia-labs/java',
    prerequisites: ['JDK 25', 'Git', 'Gradle Wrapper o Maven Wrapper'],
    createCommands: ['mkdir -p academia-labs/java/src/{main,test}/java/academy', 'cd academia-labs/java', 'git init', 'java --version', 'javac --version'],
    structure: ['src/main/java/academy/', 'src/test/java/academy/', 'build.gradle.kts', 'settings.gradle.kts', 'README.md'],
    runCommand: './gradlew test  # Windows: .\\gradlew.bat test',
    expected: 'Gradle compila con JDK 25 y todas las pruebas terminan correctamente.',
    recovery: ['Si javac no existe, instalaste un JRE y no un JDK.', 'Si JAVA_HOME apunta a otra versión, corrígelo y abre una terminal nueva.'],
  },
  'spring-boot': {
    workspace: 'academia-labs/spring-api',
    prerequisites: ['JDK 25', 'curl o navegador', 'Git'],
    createCommands: ['mkdir -p academia-labs && cd academia-labs', 'curl -G https://start.spring.io/starter.zip -d type=maven-project -d language=java -d javaVersion=25 -d artifactId=spring-api -d dependencies=webflux,data-r2dbc,h2 -o spring-api.zip', 'unzip spring-api.zip -d spring-api && cd spring-api', 'git init'],
    structure: ['src/main/java/.../SpringApiApplication.java', 'src/main/java/.../delivery/', 'src/main/resources/application.yml', 'src/test/java/.../', 'pom.xml'],
    runCommand: './mvnw spring-boot:run  # Windows: .\\mvnw.cmd spring-boot:run',
    expected: 'La aplicación arranca, Netty escucha el puerto 8080 y GET /actuator/health responde cuando Actuator esté incluido.',
    recovery: ['Si UnsupportedClassVersionError aparece, verifica java --version.', 'Si falta una clase reactiva, confirma webflux y data-r2dbc en pom.xml.'],
  },
  'kotlin-multiplatform': {
    workspace: 'academia-labs/kmp-app',
    prerequisites: ['JDK 25', 'Android Studio o IntelliJ', 'Xcode para iOS'],
    createCommands: ['Crea un proyecto Kotlin Multiplatform desde el asistente oficial', 'Guárdalo como academia-labs/kmp-app', 'cd academia-labs/kmp-app', 'git init', './gradlew tasks'],
    structure: ['shared/src/commonMain/', 'shared/src/commonTest/', 'shared/src/androidMain/', 'shared/src/iosMain/', 'composeApp/'],
    runCommand: './gradlew :shared:allTests  # Windows: .\\gradlew.bat :shared:allTests',
    expected: 'Compila commonMain y las pruebas compartidas terminan correctamente.',
    recovery: ['Si iOS no aparece, recuerda que Xcode solo existe en macOS.', 'Si Gradle usa otro JDK, revisa la configuración del IDE y JAVA_HOME.'],
  },
  android: {
    workspace: 'academia-labs/android-app',
    prerequisites: ['Android Studio', 'Android SDK', 'JDK incluido con el IDE'],
    createCommands: ['New Project → Empty Activity', 'Nombre: AcademiaLab · Kotlin · Jetpack Compose', 'Guarda en academia-labs/android-app', 'git init', './gradlew tasks'],
    structure: ['app/src/main/java/.../', 'app/src/test/', 'app/src/androidTest/', 'app/src/main/AndroidManifest.xml', 'gradle/libs.versions.toml'],
    runCommand: './gradlew testDebugUnitTest  # Windows: .\\gradlew.bat testDebugUnitTest',
    expected: 'Gradle compila la variante debug y las pruebas unitarias pasan.',
    recovery: ['Si no hay dispositivo, crea un emulador compatible con la arquitectura del equipo.', 'Si KVM/Hypervisor falla, corrige virtualización antes de continuar.'],
  },
  ios: {
    workspace: 'academia-labs/ios-app',
    prerequisites: ['macOS', 'Xcode', 'Git'],
    createCommands: ['Xcode → New Project → iOS App', 'Interface: SwiftUI · Language: Swift', 'Guarda en academia-labs/ios-app y activa Git', 'xcodebuild -version'],
    structure: ['AcademiaLabApp.swift', 'Features/', 'Domain/', 'Infrastructure/', 'AcademiaLabTests/'],
    runCommand: 'xcodebuild test -scheme AcademiaLab -destination "platform=iOS Simulator,name=iPhone 16"',
    expected: 'El simulador inicia la app y las pruebas del scheme pasan.',
    recovery: ['Si el simulador indicado no existe, lista destinos con xcodebuild -showdestinations.', 'En Windows/Linux limita la práctica a paquetes Swift; SwiftUI requiere macOS.'],
  },
  flutter: {
    workspace: 'academia-labs/flutter_app',
    prerequisites: ['Flutter estable', 'Android Studio; Xcode para iOS', 'Git'],
    createCommands: ['flutter doctor -v', 'flutter create --org com.academia academia-labs/flutter_app', 'cd academia-labs/flutter_app', 'git init', 'flutter pub get'],
    structure: ['lib/main.dart', 'lib/features/', 'lib/domain/', 'lib/infrastructure/', 'test/', 'integration_test/'],
    runCommand: 'flutter run',
    expected: 'La app abre en el dispositivo seleccionado y flutter analyze no reporta errores.',
    recovery: ['Resuelve primero las marcas rojas de flutter doctor para tu plataforma objetivo.', 'Si no hay dispositivo, confirma flutter devices y arranca el emulador.'],
  },
  rutaflow: {
    workspace: 'academia-labs/rutaflow',
    prerequisites: ['Git', 'Docker', 'Node.js', 'Java 25', 'Flutter'],
    createCommands: ['mkdir -p academia-labs/rutaflow/{apps,services,packages,infra,docs,evidence}', 'cd academia-labs/rutaflow', 'git init', 'touch README.md .env.example compose.yaml'],
    structure: ['apps/web/', 'apps/mobile/', 'services/delivery-api/', 'packages/contracts/', 'infra/', 'docs/adr/', 'evidence/'],
    runCommand: 'docker compose config && docker compose up -d',
    expected: 'Compose valida, los servicios están saludables y README explica cómo detener y limpiar.',
    recovery: ['Si un servicio no está saludable, inspecciona docker compose logs <servicio>.', 'Si falla la conexión, distingue localhost de nombres de servicio entre contenedores.'],
  },
};

export function findProjectBootstrap(trackId: string): ProjectBootstrap | null {
  return BOOTSTRAPS[trackId] ?? null;
}
