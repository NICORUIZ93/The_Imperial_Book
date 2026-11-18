import 'package:socket_io_client/socket_io_client.dart' as io;

void main() {
  final socket = io.io('http://127.0.0.1:3100', io.OptionBuilder()
      .setTransports(['websocket']).disableAutoConnect()
      .setAuth({'token': 'solo-laboratorio'}).build());
  socket.onConnect((_) {
    socket.emitWithAck('seguir-envio', 'ENV-42', ack: (data) => print(data));
  });
  socket.on('posicion', (data) { print(data); socket.dispose(); });
  socket.onConnectError((error) { print(error); socket.dispose(); });
  socket.connect();
}
