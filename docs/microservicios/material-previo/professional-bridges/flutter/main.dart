import 'package:flutter/material.dart';

void main() => runApp(const DraftApp());
class DraftApp extends StatelessWidget {
  const DraftApp({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(
    restorationScopeId: 'entregas', home: DraftPage());
}
class DraftPage extends StatefulWidget {
  const DraftPage({super.key});
  @override
  State<DraftPage> createState() => _DraftState();
}
class _DraftState extends State<DraftPage> with RestorationMixin {
  final address = RestorableTextEditingController();
  @override
  String get restorationId => 'borrador';
  @override
  void restoreState(RestorationBucket? oldBucket, bool initialRestore) {
    registerForRestoration(address, 'direccion');
  }
  @override
  void dispose() {
    address.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Borrador')),
    body: Padding(padding: const EdgeInsets.all(24), child: TextField(
      controller: address.value,
      decoration: const InputDecoration(labelText: 'Dirección'))));
}
