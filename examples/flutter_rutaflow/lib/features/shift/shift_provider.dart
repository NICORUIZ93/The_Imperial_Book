import 'package:flutter_riverpod/flutter_riverpod.dart';

class Stop {
  const Stop(this.id, this.address, {this.done = false});

  final String id;
  final String address;
  final bool done;
}

class ShiftNotifier extends Notifier<List<Stop>> {
  @override
  List<Stop> build() => const [];

  void load(List<Stop> stops) => state = List.unmodifiable(stops);

  void complete(String id) {
    if (!state.any((stop) => stop.id == id)) return;

    state = List.unmodifiable([
      for (final stop in state)
        if (stop.id == id)
          Stop(stop.id, stop.address, done: true)
        else
          stop,
    ]);
  }
}

final shiftProvider = NotifierProvider<ShiftNotifier, List<Stop>>(
  ShiftNotifier.new,
);
