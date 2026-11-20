// Módulo 24 · F149 · El mismo modelo en Structurizr DSL (alternativa a c4.js). Pégalo en https://playground.structurizr.com
// o ábrelo con Structurizr Lite. Solo contexto y contenedores principales.
workspace "Tienda en línea" "Modelo C4 del curso" {
    model {
        cliente = person "Cliente" "Compra productos desde el navegador o el móvil"
        pasarela = softwareSystem "Pasarela de pagos" "Cobra con tarjeta (proveedor externo)"
        tienda = softwareSystem "Tienda" "Catálogo, pedidos y pagos de la tienda" {
            web = container "Aplicación web" "Interfaz de compra" "Angular"
            bff = container "BFF" "API para la web y el móvil" "Node.js 26 + Express 5"
            pedidos = container "Servicio de pedidos" "Crea y consulta pedidos" "Node.js 26 + Express 5"
            bdpedidos = container "BD de pedidos" "Pedidos y líneas" "PostgreSQL 18" {
                tags "Database"
            }
        }
        cliente -> web "Compra en" "HTTPS"
        web -> bff "Llama a" "JSON/HTTPS"
        bff -> pedidos "Crea pedidos en" "JSON/HTTP"
        pedidos -> bdpedidos "Lee y escribe" "SQL"
        tienda -> pasarela "Cobra con" "HTTPS"
    }
    views {
        systemContext tienda "Contexto" {
            include *
            autolayout lr
        }
        container tienda "Contenedores" {
            include *
            autolayout lr
        }
        styles {
            element "Database" {
                shape cylinder
            }
        }
    }
}
