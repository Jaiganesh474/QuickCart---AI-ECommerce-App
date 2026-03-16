import 'package:flutter/material.dart';
import '../core/api_client.dart';

class DeliveryOrder {
  final String id;
  final String address;
  final String status;
  final double itemsCost;

  DeliveryOrder({required this.id, required this.address, required this.status, required this.itemsCost});

  factory DeliveryOrder.fromJson(Map<String, dynamic> json) {
    return DeliveryOrder(
      id: json['id']?.toString() ?? '',
      address: json['shippingAddress'] ?? 'N/A',
      status: json['status'] ?? 'PENDING',
      itemsCost: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class DeliveryProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  List<DeliveryOrder> _availableTasks = [];
  DeliveryOrder? _activeOrder;
  bool _isLoading = false;

  List<DeliveryOrder> get availableTasks => _availableTasks;
  DeliveryOrder? get activeOrder => _activeOrder;
  bool get isLoading => _isLoading;

  Future<void> fetchDeliveryData() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/delivery/tasks');
      if (response.statusCode == 200) {
        final List data = response.data;
        _availableTasks = data.map((j) => DeliveryOrder.fromJson(j)).toList();
      }
      
      final activeResponse = await _apiClient.dio.get('/api/delivery/active');
      if (activeResponse.statusCode == 200 && activeResponse.data != null) {
        _activeOrder = DeliveryOrder.fromJson(activeResponse.data);
      } else {
        _activeOrder = null;
      }
    } catch (e) {
      print("Delivery fetch error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    try {
      await _apiClient.dio.put('/api/orders/$orderId/status', data: {'status': status});
      fetchDeliveryData();
    } catch (e) {
      print("Status update error: $e");
    }
  }
}
