// lib/features/deliveries/domain/delivery_providers.dart - Riverpod providers
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api_client.dart';
import '../../../core/models.dart';

// Tema 3: Riverpod providers architecture
// This file demonstrates StateProvider, FutureProvider, and AsyncNotifier

/// API client provider - shared singleton
final apiClientProvider = Provider((ref) {
  return RutaFlowApiClient();
});

/// Deliveries list - async data from API
/// Watches ref to auto-refresh when dependencies change
final deliveriesProvider = FutureProvider<List<Delivery>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  return apiClient.getDeliveries();
});

/// Single delivery detail
final deliveryDetailProvider =
    FutureProvider.family<DeliveryDetail, String>((ref, deliveryId) async {
  final apiClient = ref.watch(apiClientProvider);
  return apiClient.getDeliveryDetail(deliveryId);
});

/// Selected delivery ID for detail view (Tema 3: State provider)
final selectedDeliveryProvider = StateProvider<String?>((ref) {
  return null; // Initially no delivery selected
});

/// Delivery status update notifier
/// Demonstrates difference between watch (for subscriptions) vs read (for one-time reads)
final deliveryStatusNotifierProvider =
    StateNotifierProvider<DeliveryStatusNotifier, AsyncValue<Delivery>>(
  (ref) => DeliveryStatusNotifier(ref),
);

class DeliveryStatusNotifier extends StateNotifier<AsyncValue<Delivery>> {
  final Ref ref;

  DeliveryStatusNotifier(this.ref) : super(const AsyncValue.data(
    Delivery(
      id: '',
      guia: '',
      estado: '',
      cliente: '',
      direccion: '',
      lat: 0,
      lng: 0,
      fechaCreacion: DateTime.now(),
    ),
  ));

  /// Fallo deliberado: This demonstrates incorrect ref.watch usage (Tema 4)
  /// In a callback, always use ref.read() not ref.watch()
  Future<void> updateStatus(String deliveryId, String newStatus) async {
    state = const AsyncValue.loading();
    try {
      // CORRECTO: ref.read() in callbacks
      final apiClient = ref.read(apiClientProvider);
      final updated = await apiClient.updateDeliveryStatus(deliveryId, newStatus);
      state = AsyncValue.data(updated);
      // Invalidate the deliveries list to refresh it
      ref.invalidate(deliveriesProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

/// Cached deliveries list (Tema 8: Offline persistence)
/// This could be backed by Hive for offline support
final cachedDeliveriesProvider = StateProvider<List<Delivery>>((ref) {
  // Reads from API provider, but can fallback to cached values
  final asyncDeliveries = ref.watch(deliveriesProvider);
  return asyncDeliveries.maybeWhen(
    data: (deliveries) => deliveries,
    orElse: () => [], // Empty list until data loads
  );
});
