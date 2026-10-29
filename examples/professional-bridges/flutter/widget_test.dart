import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:restauracion_demo/main.dart';

void main() {
  testWidgets('restaura el texto transitorio', (tester) async {
    await tester.pumpWidget(const DraftApp());
    await tester.enterText(find.byType(TextField), 'Calle 42');
    await tester.pump(); // Serializa el cambio antes de simular la restauración.
    await tester.restartAndRestore();
    expect(find.text('Calle 42'), findsOneWidget);
  });
}
