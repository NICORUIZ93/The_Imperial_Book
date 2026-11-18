// lib/core/models.dart - Models for RutaFlow delivery app
import 'package:json_annotation/json_annotation.dart';

part 'models.g.dart';

@JsonSerializable()
class Delivery {
  final String id;
  final String guia;
  final String estado; // pending, in_transit, delivered, failed
  final String cliente;
  final String direccion;
  final double lat;
  final double lng;
  final DateTime fechaCreacion;
  final DateTime? fechaEntrega;

  Delivery({
    required this.id,
    required this.guia,
    required this.estado,
    required this.cliente,
    required this.direccion,
    required this.lat,
    required this.lng,
    required this.fechaCreacion,
    this.fechaEntrega,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) =>
      _$DeliveryFromJson(json);

  Map<String, dynamic> toJson() => _$DeliveryToJson(this);
}

@JsonSerializable()
class DeliveryDetail {
  final Delivery delivery;
  final List<LocationUpdate> locations;
  final String? notes;
  final String? signature;

  DeliveryDetail({
    required this.delivery,
    required this.locations,
    this.notes,
    this.signature,
  });

  factory DeliveryDetail.fromJson(Map<String, dynamic> json) =>
      _$DeliveryDetailFromJson(json);

  Map<String, dynamic> toJson() => _$DeliveryDetailToJson(this);
}

@JsonSerializable()
class LocationUpdate {
  final double lat;
  final double lng;
  final DateTime timestamp;
  final double accuracy;

  LocationUpdate({
    required this.lat,
    required this.lng,
    required this.timestamp,
    required this.accuracy,
  });

  factory LocationUpdate.fromJson(Map<String, dynamic> json) =>
      _$LocationUpdateFromJson(json);

  Map<String, dynamic> toJson() => _$LocationUpdateToJson(this);
}

@JsonSerializable()
class ApiErrorResponse {
  final String message;
  final int? code;
  final String? details;

  ApiErrorResponse({
    required this.message,
    this.code,
    this.details,
  });

  factory ApiErrorResponse.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ApiErrorResponseToJson(this);
}
