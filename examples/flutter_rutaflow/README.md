# RutaFlow Flutter - Aplicación de Entregas

Aplicación Flutter completa que demuestra mejores prácticas de Flutter, conectando 10 temas del módulo de Flutter con un proyecto integrador real.

## Estructura del Proyecto

```
lib/
├── main.dart                           # Punto de entrada, ProviderScope
├── core/
│   ├── models.dart                     # Modelos JSON (Tema 2)
│   └── api_client.dart                 # Cliente Dio con interceptors (Tema 1, 5)
└── features/
    └── deliveries/
        ├── domain/
        │   └── delivery_providers.dart # Riverpod providers (Tema 3)
        ├── data/
        │   └── delivery_repository.dart
        └── presentation/
            ├── delivery_list_screen.dart    # Lista con Riverpod (Tema 4)
            └── delivery_detail_screen.dart  # Detalle + actualización (Tema 6, 9)
```

## Temas Integrados

1. **Setup + API client (dio)** - `lib/core/api_client.dart`
   - Configuración de Dio con interceptors
   - Manejo de errores y timeouts

2. **Model deserialization (json_serializable)** - `lib/core/models.dart`
   - Serialización JSON automática con anotaciones
   - Validación de tipos

3. **Riverpod providers** - `lib/features/deliveries/domain/delivery_providers.dart`
   - FutureProvider para datos async
   - StateProvider para estado local
   - AsyncNotifier para operaciones complejas

4. **List view with cached state** - `lib/features/deliveries/presentation/delivery_list_screen.dart`
   - ConsumerWidget con ref.watch()
   - Manejo de estados loading/error/data
   - Keys correctas en listas reordenables

5. **Detail screen navigation** - `lib/features/deliveries/presentation/delivery_detail_screen.dart`
   - FutureProvider.family para datos paramétricos
   - Navegación con argumentos

6. **Actualización de estado remoto** - `delivery_detail_screen.dart`
   - ref.read() en callbacks
   - Invalidación de providers

7. **Real-time updates** - `delivery_providers.dart`
   - Socket.IO simulation con StateProvider
   - Cache invalidation

8. **Offline persistence** - `cachedDeliveriesProvider`
   - Fallback a cache cuando no hay conexión
   - Preparado para Hive

9. **Error handling + retry** - Distribuido en todos los archivos
   - Try/catch en API client
   - Error UI con botón retry
   - Manejo de timeout

10. **Testing data flow** - Estructura lista para unit tests
    - Providers aislados sin contexto
    - Modelos serializables

## Ejecutar la Aplicación

```bash
cd examples/flutter_rutaflow
flutter pub get
flutter run -d <device>
```

## En Flutter DevTools

Después de `flutter run`, abre DevTools en el navegador y explora:

1. **Performance tab**: Detecta jank durante scroll
2. **Network tab**: Inspecciona requests Dio y responses
3. **Console tab**: Ve logs de interceptors
4. **Database tab**: Inspecciona Hive (cuando se agregue)

## Fallos Deliberados Incluidos

Este ejemplo intencionalmente demuestra antipatrones (comentados) para que los estudien:

- `ref.watch()` en callbacks (incorrecto, Tema 3)
- Ausencia de Key en lista reordenable (Tema 4)
- setState después de dispose (comentado, Tema 1)

## Próximos Pasos

- Agregar Google Maps (Tema 7)
- Implementar Hive para persistencia (Tema 8)
- Agregar tests unitarios y de widgets (Tema 9)
- Implementar Socket.IO real para actualizaciones en tiempo real

## Referencias Oficiales

- Riverpod: https://riverpod.dev
- Dio: https://pub.dev/packages/dio
- json_serializable: https://pub.dev/packages/json_serializable
- Flutter DevTools: https://docs.flutter.dev/development/tools/devtools
