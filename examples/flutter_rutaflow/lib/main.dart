// lib/main.dart - Main entry point for RutaFlow Flutter app
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'features/deliveries/presentation/delivery_list_screen.dart';
import 'features/deliveries/presentation/delivery_detail_screen.dart';

void main() {
  runApp(const ProviderScope(child: RutaFlowApp()));
}

class RutaFlowApp extends StatelessWidget {
  const RutaFlowApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RutaFlow Delivery',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      home: const DeliveryListScreen(),
      routes: {
        '/deliveries': (context) => const DeliveryListScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name?.startsWith('/delivery/') ?? false) {
          final deliveryId = settings.name!.split('/').last;
          return MaterialPageRoute(
            builder: (context) => DeliveryDetailScreen(deliveryId: deliveryId),
          );
        }
        return null;
      },
    );
  }
}
