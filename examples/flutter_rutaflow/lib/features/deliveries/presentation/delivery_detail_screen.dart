// lib/features/deliveries/presentation/delivery_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models.dart';
import '../domain/delivery_providers.dart';

/// Tema 6: Detail screen navigation
/// Demonstrates:
/// - FutureProvider.family for parameterized async data
/// - ref.watch() to display loading/error/data states
/// - Updating delivery status with error handling
class DeliveryDetailScreen extends ConsumerWidget {
  final String deliveryId;

  const DeliveryDetailScreen({
    required this.deliveryId,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(deliveryDetailProvider(deliveryId));
    final statusAsync = ref.watch(deliveryStatusNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Detalles de Entrega')),
      body: detailAsync.when(
        data: (detail) => SingleChildScrollView(
          child: Column(
            children: [
              _HeaderCard(delivery: detail.delivery),
              const SizedBox(height: 16),
              _LocationHistoryCard(locations: detail.locations),
              const SizedBox(height: 16),
              _StatusUpdateCard(
                deliveryId: deliveryId,
                currentStatus: detail.delivery.estado,
                isUpdating: statusAsync.isLoading,
                ref: ref,
              ),
              if (detail.notes != null) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Notas',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(detail.notes!),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text('Error cargando detalle: $error'),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  final Delivery delivery;

  const _HeaderCard({required this.delivery});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Guía: ${delivery.guia}',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(delivery.cliente),
                  ],
                ),
                _statusBadge(delivery.estado),
              ],
            ),
            const SizedBox(height: 16),
            Text('Dirección: ${delivery.direccion}'),
            Text('Creada: ${delivery.fechaCreacion.toString()}'),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String estado) {
    final color = switch (estado) {
      'pending' => Colors.orange,
      'in_transit' => Colors.blue,
      'delivered' => Colors.green,
      'failed' => Colors.red,
      _ => Colors.grey,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        estado,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _LocationHistoryCard extends StatelessWidget {
  final List<LocationUpdate> locations;

  const _LocationHistoryCard({required this.locations});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Historial de Ubicaciones',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...locations
                .map((loc) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        '${loc.lat.toStringAsFixed(4)}, ${loc.lng.toStringAsFixed(4)} - ${loc.timestamp}',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ))
                .toList(),
          ],
        ),
      ),
    );
  }
}

class _StatusUpdateCard extends ConsumerWidget {
  final String deliveryId;
  final String currentStatus;
  final bool isUpdating;
  final WidgetRef ref;

  const _StatusUpdateCard({
    required this.deliveryId,
    required this.currentStatus,
    required this.isUpdating,
    required this.ref,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Actualizar Estado',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                _StatusButton(
                  label: 'En Tránsito',
                  onPressed: isUpdating
                      ? null
                      : () => _updateStatus(context, 'in_transit'),
                ),
                _StatusButton(
                  label: 'Entregado',
                  onPressed: isUpdating
                      ? null
                      : () => _updateStatus(context, 'delivered'),
                ),
                _StatusButton(
                  label: 'Falló',
                  onPressed: isUpdating
                      ? null
                      : () => _updateStatus(context, 'failed'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, String newStatus) async {
    try {
      // Tema 9: Using ref.read() in callbacks (correct), not ref.watch()
      await ref
          .read(deliveryStatusNotifierProvider.notifier)
          .updateStatus(deliveryId, newStatus);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Estado actualizado correctamente')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }
}

class _StatusButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const _StatusButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }
}
