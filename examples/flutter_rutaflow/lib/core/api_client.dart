// lib/core/api_client.dart - Dio API client with interceptors
import 'package:dio/dio.dart';
import 'models.dart';

/// API client for RutaFlow delivery service
/// Demonstrates:
/// - Dio HTTP client with interceptors
/// - Request/response logging
/// - Error handling (Tema 5)
/// - Authentication headers
class RutaFlowApiClient {
  final Dio _dio;
  final String baseUrl = 'http://localhost:3000/api'; // Local Floci stack

  RutaFlowApiClient({Dio? dio})
      : _dio = dio ?? Dio(BaseOptions(connectTimeout: Duration(seconds: 10))) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token to every request
          options.headers['Authorization'] = 'Bearer token-placeholder';
          print('[API Request] ${options.method.toUpperCase()} ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('[API Response] ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('[API Error] ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  /// Get all deliveries for the current day (Tema 2: Model deserialization)
  Future<List<Delivery>> getDeliveries() async {
    try {
      final response = await _dio.get('$baseUrl/deliveries');
      final deliveries = (response.data['deliveries'] as List)
          .map((d) => Delivery.fromJson(d as Map<String, dynamic>))
          .toList();
      return deliveries;
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  /// Get a specific delivery with full details (Tema 4: Detail screen)
  Future<DeliveryDetail> getDeliveryDetail(String deliveryId) async {
    try {
      final response = await _dio.get('$baseUrl/deliveries/$deliveryId');
      return DeliveryDetail.fromJson(response.data);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  /// Update delivery status (Tema 9: Error handling + retry)
  Future<Delivery> updateDeliveryStatus(
    String deliveryId,
    String newStatus, {
    String? notes,
  }) async {
    try {
      final response = await _dio.patch(
        '$baseUrl/deliveries/$deliveryId',
        data: {'estado': newStatus, if (notes != null) 'notes': notes},
      );
      return Delivery.fromJson(response.data);
    } on DioException catch (e) {
      // Retry logic could be added here
      _handleDioError(e);
      rethrow;
    }
  }

  /// Handle common DIO errors (Tema 5: Networking error handling)
  void _handleDioError(DioException error) {
    if (error.response != null) {
      // Server responded with error status
      final errorData = error.response!.data;
      if (errorData is Map && errorData['message'] != null) {
        print('Server error: ${errorData['message']}');
      }
    } else if (error.type == DioExceptionType.connectionTimeout) {
      print('Connection timeout - check your network');
    } else if (error.type == DioExceptionType.unknown) {
      print('Network error - check connectivity');
    }
  }

  void dispose() {
    _dio.close();
  }
}
