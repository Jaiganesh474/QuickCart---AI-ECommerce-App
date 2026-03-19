import 'package:flutter/material.dart';
import '../core/api_client.dart';

class DeliveryOrder {
  final String id;
  final String address;
  final String status;
  final double itemsCost;
  final String customerName;
  final String customerPhone;

  DeliveryOrder({required this.id, required this.address, required this.status, required this.itemsCost, required this.customerName, required this.customerPhone});

  factory DeliveryOrder.fromJson(Map<String, dynamic> json) {
    return DeliveryOrder(
      id: json['id']?.toString() ?? '',
      address: json['shippingAddress'] != null ? json['shippingAddress']['streetAddress'] ?? 'N/A' : 'N/A',
      status: json['status'] ?? 'PENDING',
      itemsCost: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      customerName: json['user'] != null ? json['user']['name'] ?? 'Guest' : 'Guest',
      customerPhone: json['user'] != null ? json['user']['mobileNumber'] ?? 'N/A' : 'N/A',
    );
  }
}

class DeliveryProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  List<DeliveryOrder> _availableTasks = [];
  List<DeliveryOrder> _myOrders = [];
  bool _isLoading = false;

  List<DeliveryOrder> get availableTasks => _availableTasks;
  List<DeliveryOrder> get myOrders => _myOrders;
  DeliveryOrder? get activeOrder => _myOrders.isNotEmpty ? _myOrders.firstWhere((o) => o.status == 'OUT_FOR_DELIVERY', orElse: () => _myOrders.first) : null;
  bool get isLoading => _isLoading;

  Future<bool> fetchDeliveryData() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/delivery/available');
      if (response.statusCode == 200) {
        final List data = response.data;
        _availableTasks = data.map((j) => DeliveryOrder.fromJson(j)).toList();
      }
      
      final myResponse = await _apiClient.dio.get('/api/delivery/my-orders');
      if (myResponse.statusCode == 200) {
        final List data = myResponse.data;
        _myOrders = data.map((j) => DeliveryOrder.fromJson(j)).toList();
      }
      return true;
    } catch (e) {
      print("Delivery fetch error: $e");
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> acceptTask(String orderId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.post('/api/delivery/pick/$orderId');
      if (response.statusCode == 200) {
        await fetchDeliveryData();
        return true;
      }
    } catch (e) {
      print("Accept task error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final response = await _apiClient.dio.put('/api/orders/$orderId/status', queryParameters: {'status': status.toUpperCase()});
      if (response.statusCode == 200) {
        await fetchDeliveryData();
        return true;
      }
    } catch (e) {
      print("Status update error: $e");
    }
    return false;
  }
}
