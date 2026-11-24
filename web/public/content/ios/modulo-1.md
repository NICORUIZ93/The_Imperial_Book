# Módulo 1: SwiftUI: vistas y layout declarativo


## Aprende construyendo


### Tema 1: El protocolo View y composición · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a construir TarjetaEnvio, una vista propia que muestra un envío de RutaFlow, y a componerla dentro de otra vista como si fuera nativa. Prerrequisitos: macOS, Xcode y Swift; verifica xcodebuild -version.

#### ► CÓMO FUNCIONA
```mermaid
graph TB
    A["Protocolo View<br/>(contrato universal)"]
    B["Text<br/>(nativa)"] -.-> A
    C["Button<br/>(nativa)"] -.-> A
    D["TarjetaEnvio<br/>(propia)"] -.-> A
    E["ListaEnvios<br/>(compuesta)"] -.-> A
    
    E --> B1["compone"]
    E --> D1["compone"]
    D1 --> C1["Text"]
    D1 --> C2["padding"]
    C2 --> C3["background"]
    
    style A fill:#4a90e2,stroke:#2c5aa0,color:#fff
    style B fill:#90ee90
    style C fill:#90ee90
    style D fill:#ffd700
    style E fill:#ffd700
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph TB
    A["Protocolo View<br/>(contrato universal)"]
    B["Text<br/>(nativa)"] -.-> A
    C["Button<br/>(nativa)"] -.-> A
    D["TarjetaEnvio<br/>(propia)"] -.-> A
    E["ListaEnvios<br/>(compuesta)"] -.-> A
    
    E --> B1["compone"]
    E --> D1["compone"]
    D1 --> C1["Text"]
    D1 --> C2["padding"]
    C2 --> C3["background"]
    
    style A fill:#4a90e2,stroke:#2c5aa0,color:#fff
    style B fill:#90ee90
    style C fill:#90ee90
    style D fill:#ffd700
    style E fill:#ffd700
```

```swift
import SwiftUI

struct TarjetaEnvio: View {
    let guia: String
    let entregada: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Guía: \(guia)").font(.headline)
                Text(entregada ? "Entregada" : "En ruta")
            }
            Spacer()
            Image(systemName: entregada ? "checkmark.circle.fill" : "truck.box")
                .foregroundStyle(entregada ? .green : .blue)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(.rect(cornerRadius: 8))
    }
}

struct ListaEnvios: View {
    var body: some View {
        VStack {
            TarjetaEnvio(guia: "RF-4471", entregada: false)
            TarjetaEnvio(guia: "RF-5002", entregada: true)
        }
    }
}
```

```swift
struct TarjetaTarea: View {
    let titulo: String
    var body: some View {
        Text(titulo).padding().background(Color.blue.opacity(0.1))
    }
}
```

```swift
struct TarjetaEnvio: View {
    let guia: String
    let estado: String
    var body: some View {
        Text("\(guia): \(estado)").padding().background(Color.blue.opacity(0.1))
    }
}

struct ListaEnvios: View {
    var body: some View {
        VStack {
            TarjetaEnvio(guia: "RF-4471", estado: "en ruta")
            TarjetaEnvio(guia: "RF-5002", estado: "entregado")
        }
    }
}
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

```swift
struct ListaEnviosConDuplicacion: View {
    var body: some View {
        VStack {
            TarjetaEnvio(guia: "RF-4471", estado: "en ruta")
            TarjetaEnvio(guia: "RF-5002", estado: "entregado")
            // Fallo deliberado: duplicación de código
            Text("RF-5003: en ruta").padding().background(Color.blue.opacity(0.1))
        }
    }
}
```

</details>

### Tema 2: Orden de modificadores y layout con stacks · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a ver con tus propios ojos por qué .padding().background() y .background().padding() se ven distinto en TarjetaEnvio (Tema 1). Prerrequisitos: Tema 1 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
graph LR
    A["Text<br/>'RF-4471'"]
    
    subgraph order1["Orden 1: .padding().background()"]
        P1["padding<br/>(añade espacio)"]
        BG1["background<br/>(fondo alrededor)"]
        P1 --> BG1
    end
    
    subgraph order2["Orden 2: .background().padding()"]
        BG2["background<br/>(fondo ajustado)"]
        P2["padding<br/>(espacio afuera)"]
        BG2 --> P2
    end
    
    A --> order1
    A --> order2
    
    BG1 --> R1["Resultado: fondo cubre padding"]
    P2 --> R2["Resultado: padding sin fondo"]
    
    style A fill:#90ee90
    style P1 fill:#87ceeb
    style BG1 fill:#ffd700
    style R1 fill:#ffcccc
    
    style BG2 fill:#ffd700
    style P2 fill:#87ceeb
    style R2 fill:#ccffcc
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph LR
    A["Text<br/>'RF-4471'"]
    
    subgraph order1["Orden 1: .padding().background()"]
        P1["padding<br/>(añade espacio)"]
        BG1["background<br/>(fondo alrededor)"]
        P1 --> BG1
    end
    
    subgraph order2["Orden 2: .background().padding()"]
        BG2["background<br/>(fondo ajustado)"]
        P2["padding<br/>(espacio afuera)"]
        BG2 --> P2
    end
    
    A --> order1
    A --> order2
    
    BG1 --> R1["Resultado: fondo cubre padding"]
    P2 --> R2["Resultado: padding sin fondo"]
    
    style A fill:#90ee90
    style P1 fill:#87ceeb
    style BG1 fill:#ffd700
    style R1 fill:#ffcccc
    
    style BG2 fill:#ffd700
    style P2 fill:#87ceeb
    style R2 fill:#ccffcc
```

```swift
Text("Hola").padding().background(Color.blue)   // padding queda DENTRO del fondo azul
Text("Hola").background(Color.blue).padding()    // padding queda FUERA, el fondo no lo cubre
```

```swift
VStack(spacing: 8) {
    HStack { Text("Izquierda"); Spacer(); Text("Derecha") }
    ZStack { Image("fondo"); Text("Superpuesto") }
}
```

```swift
Text("RF-4471: en ruta").padding().background(Color.blue)   // el fondo cubre también el padding
Text("RF-4471: en ruta").background(Color.blue).padding()   // el fondo queda ajustado al texto, el padding se ve sin cubrir
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

```swift
struct TarjetaEnvioConOrderIncorrecto: View {
    let guia: String
    let estado: String
    
    var body: some View {
        Text("\(guia): \(estado)")
            .padding()                          // primer padding
            .background(Color.blue)             // fondo azul alrededor
            .padding()                          // SEGUNDO padding (¿esperando que se sume?)
    }
}
```

</details>

### Tema 3: Previews, LazyVGrid/ScrollView y property wrappers · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a mostrar una lista completa de envíos de RutaFlow con LazyVGrid dentro de un ScrollView, e iterar su diseño con Previews sin correr la app. Prerrequisitos: Temas 1-2 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A["#Preview"] --> B{"¿Datos de muestra fijos\no llamada de red real?"}
    B -->|Muestra fija| C["Renderiza casi instantáneo\nen el canvas de Xcode"]
    B -->|Red real| D["Carga indefinida o falla:\nPreviews no esperan respuestas async reales"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```swift
#Preview {
    TarjetaTarea(titulo: "Comprar leche")
}
```

```mermaid
flowchart TD
    A["#Preview"] --> B{"¿Datos de muestra fijos\no llamada de red real?"}
    B -->|Muestra fija| C["Renderiza casi instantáneo\nen el canvas de Xcode"]
    B -->|Red real| D["Carga indefinida o falla:\nPreviews no esperan respuestas async reales"]
```

```swift
import SwiftUI

struct TarjetaEnvio: View {
    let guia: String
    let estado: String

    var body: some View {
        Text("\(guia): \(estado)")
            .padding()
            .background(Color.blue.opacity(0.1))
    }
}
```

```swift
struct ListaEnviosGrid: View {
    let envios: [(guia: String, estado: String)]
    var body: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                ForEach(envios, id: \.guia) { envio in
                    TarjetaEnvio(guia: envio.guia, estado: envio.estado)
                }
            }
        }
    }
}

#Preview {
    ListaEnviosGrid(envios: [("RF-4471", "en ruta"), ("RF-5002", "entregado")])
}
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

</details>
