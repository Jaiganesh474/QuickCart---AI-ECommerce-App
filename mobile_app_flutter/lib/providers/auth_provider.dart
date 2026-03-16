import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../models/user.dart';
import '../models/order.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  List<Order> _orders = [];
  bool _loading = false;
  final ApiClient _apiClient = ApiClient();

  User? get user => _user;
  List<Order> get orders => _orders;
  bool get loading => _loading;

  Future<void> fetchOrders() async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/orders/my-orders');
      if (response.statusCode == 200) {
        final List data = response.data;
        _orders = data.map((json) => Order.fromJson(json)).toList();
      }
    } catch (e) {
      print("Orders fetch error: $e");
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('quickcart_jwt');
    
    if (token != null) {
      await fetchProfile();
    }
  }

  Future<void> fetchProfile() async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/auth/profile');
      if (response.statusCode == 200) {
        _user = User.fromJson(response.data);
      }
    } catch (e) {
      print("Profile fetch error: $e");
      logout(); // Token might be invalid
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final token = response.data['token'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('quickcart_jwt', token);
        
        await fetchProfile();
        return true;
      }
    } catch (e) {
      print("Login error: $e");
    } finally {
      _loading = false;
      notifyListeners();
    }
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.post('/api/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        final token = response.data['token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('quickcart_jwt', token);
          await fetchProfile();
        }
        return true;
      }
    } catch (e) {
      print("Register error: $e");
    } finally {
      _loading = false;
      notifyListeners();
    }
    return false;
  }

  void logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('quickcart_jwt');
    _user = null;
    _orders = [];
    notifyListeners();
  }
}
