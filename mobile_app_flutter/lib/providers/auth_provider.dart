import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../models/product.dart';
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

  String? _authError;
  String? get authError => _authError;

  Future<void> fetchOrders() async {
    _loading = true;
    _authError = null;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/orders');
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
      _apiClient.dio.options.headers['Authorization'] = 'Bearer $token';
      await fetchProfile();
    }
  }

  Future<void> fetchProfile() async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/api/auth/profile');
      if (response.statusCode == 200) {
        final userData = response.data;
        final profileJson = userData.containsKey('user') ? userData['user'] : userData;
        _user = User.fromJson(profileJson);
      }
    } catch (e) {
      print("Profile API fetch error, attempting JWT fallback: $e");
      // Fallback: Decode token if API fails but token exists
      try {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('quickcart_jwt');
        if (token != null) {
          final payload = _decodeJwt(token);
          _user = User(
            id: payload['id']?.toString() ?? payload['sub']?.toString() ?? '',
            email: payload['sub'] ?? payload['email'] ?? '',
            name: payload['name'] ?? '',
            role: payload['role'] ?? 'USER',
            mobileNumber: payload['mobileNumber'],
          );
        }
      } catch (fallbackError) {
        print("JWT Fallback error: $fallbackError");
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Map<String, dynamic> _decodeJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return {};
      final payload = parts[1];
      var normalized = base64.normalize(payload);
      var resp = utf8.decode(base64.decode(normalized));
      return json.decode(resp);
    } catch (e) {
      return {};
    }
  }

  Future<bool> login(String email, String password, {String? role}) async {
    _loading = true;
    _authError = null;
    notifyListeners();
    try {
      final data = {
        'email': email,
        'password': password,
      };
      if (role != null) data['role'] = role;

      final response = await _apiClient.dio.post('/api/auth/login', data: data);

      if (response.statusCode == 200 && response.data != null) {
        final token = response.data['token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('quickcart_jwt', token);
          _apiClient.dio.options.headers['Authorization'] = 'Bearer $token';
          await fetchProfile();
          return true;
        }
      }
    } catch (e) {
      _handleAuthError(e);
    } finally {
      _loading = false;
      notifyListeners();
    }
    return false;
  }

  Future<bool> register(String name, String email, String password, {String? mobileNumber, String? role}) async {
    _loading = true;
    _authError = null;
    notifyListeners();
    try {
      // Trying both mobileNumber and phone as backends vary
      final data = {
        'name': name,
        'email': email,
        'password': password,
        'mobileNumber': mobileNumber,
        'phone': mobileNumber, // Fallback common in some backends
      };
      if (role != null) data['role'] = role;

      final response = await _apiClient.dio.post('/api/auth/register', data: data);

      if ((response.statusCode == 201 || response.statusCode == 200) && response.data != null) {
        final token = response.data['token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('quickcart_jwt', token);
          _apiClient.dio.options.headers['Authorization'] = 'Bearer $token';
          await fetchProfile();
        }
        return true;
      }
    } catch (e) {
      _handleAuthError(e);
    } finally {
      _loading = false;
      notifyListeners();
    }
    return false;
  }

  Future<bool> becomeProfessional(String role) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.put('/api/users/role', data: {'role': role});
      if (response.statusCode == 200) {
        await fetchProfile();
        return true;
      }
    } catch (e) {
      _handleAuthError(e);
    } finally {
      _loading = false;
      notifyListeners();
    }
    return false;
  }

  List<Product> _wishlist = [];
  List<Product> get wishlist => _wishlist;

  Future<void> fetchWishlist() async {
    try {
      final response = await _apiClient.dio.get('/api/wishlist');
      if (response.statusCode == 200) {
        final List data = response.data;
        _wishlist = data.map((json) => Product.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (e) {
      print("Wishlist fetch error: $e");
    }
  }

  Future<void> toggleWishlist(Product product) async {
    final bool isInWishlist = _wishlist.any((p) => p.id == product.id);
    try {
      if (isInWishlist) {
        await _apiClient.dio.delete('/api/wishlist/${product.id}');
        _wishlist.removeWhere((p) => p.id == product.id);
      } else {
        await _apiClient.dio.post('/api/wishlist/${product.id}');
        _wishlist.add(product);
      }
      notifyListeners();
    } catch (e) {
       print("Wishlist toggle error: $e");
    }
  }

  void _handleAuthError(dynamic e) {
    if (e is DioException && e.response != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('message')) {
        _authError = data['message'];
      } else if (data is Map && data.containsKey('error')) {
        _authError = data['error'];
      } else {
        _authError = "Server Error: ${e.response!.statusCode}";
      }
    } else if (e is DioException) {
      _authError = "Network Error: ${e.type}";
    } else {
      _authError = "Authentication failed. Please try again.";
    }
    print("Auth error: $_authError ($e)");
  }

  void logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('quickcart_jwt');
    _apiClient.dio.options.headers.remove('Authorization');
    _user = null;
    _orders = [];
    _authError = null;
    notifyListeners();
  }
}

