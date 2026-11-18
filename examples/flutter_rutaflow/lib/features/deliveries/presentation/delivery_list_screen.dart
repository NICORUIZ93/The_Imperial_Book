// lib/features/deliveries/presentation/delivery_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/delivery_providers.dart';

/// Tema 4: List view with Riverpod state management
/// Demonstrates:
/// - ConsumerWidget for Riverpod integration
/// - ref.watch() for reactive subscriptions
/// - Handling AsyncValue.data/loading/error states
class DeliveryListScreen extends ConsumerWidget {
  const DeliveryListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveriesAsync = ref.watch(deliveriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('RutaFlow - Mis Entregas'),
        elevation: 0,
      ),
      body: deliveriesAsync.when(
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return const Center(
              child: Text('No hay entregas disponibles'),
            );
          }
          return ListView.builder(
            itemCount: deliveries.length,
            itemBuilder: (context, index) {
              final delivery = deliveries[index];
              return _DeliveryListTile(
                delivery: delivery,
                onTap: () {
                  // Tema 3: Navigation with selected delivery
                  ref
                      .read(selectedDeliveryProvider.notifier)
                      .state = delivery.id;
                  Navigator.of(context)
                      .pushNamed('/delivery/${delivery.id}');
                },
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        // Tema 9: Error handling UI
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Tema 9: Retry mechanism
                  ref.refresh(deliveriesProvider);
                },
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Fallo deliberado: Widget rebuild without Key in reorderable list (Tema 1)
/// If this list could be reordered and each tile had internal state,
/// the absence of a Key would cause state confusion during reordering.
class _DeliveryListTile extends StatefulWidget {
  final Delivery delivery;
  final VoidCallback onTap;

  const _DeliveryListTile({
    required this.delivery,
    required this.onTap,
    Key? key,
  }) : super(key: key ?? ValueKey(delivery.id)); // Using delivery.id as Key

  @override
  State<_DeliveryListTile> createState() => _DeliveryListTileState();
}

class _DeliveryListTileState extends State<_DeliveryListTile> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ExpansionTile(
        key: ValueKey(widget.delivery.id), // Key prevents state confusion
        title: Text('Guía: ${widget.delivery.guia}'),
        subtitle: Text(widget.delivery.cliente),
        trailing: _statusBadge(widget.delivery.estado),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _DetailRow('Cliente', widget.delivery.cliente),
                _DetailRow('Dirección', widget.delivery.direccion),
                _DetailRow('Estado', widget.delivery.estado),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: widget.onTap,
                    child: const Text('Ver Detalles'),
                  ),
                ),
              ],
            ),
          ),
        ],
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
        style: const TextStyle(color: Colors.white, fontSize: 12),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 80, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

// Importing delivery_providers to make Delivery accessible
import '../../../core/models.dart';
