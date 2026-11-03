import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_rutaflow/features/shift/shift_provider.dart';

void main() {
  test('completar una parada conserva las otras y el estado anterior', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final before = container.read(shiftProvider);
    container.read(shiftProvider.notifier).load(const [
      Stop('p-1', 'Calle 1'),
      Stop('p-2', 'Calle 2'),
    ]);
    container.read(shiftProvider.notifier).complete('p-1');

    final after = container.read(shiftProvider);
    expect(before, isEmpty);
    expect(after.map((stop) => stop.done), [true, false]);
    expect(after.map((stop) => stop.id), ['p-1', 'p-2']);
    expect(() => after.add(const Stop('p-3', 'Calle 3')), throwsUnsupportedError);
  });

  test('un id desconocido no cambia la jornada', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);
    container.read(shiftProvider.notifier).load(const [Stop('p-1', 'Calle 1')]);

    final before = container.read(shiftProvider);
    container.read(shiftProvider.notifier).complete('no-existe');

    expect(container.read(shiftProvider), same(before));
  });
}
