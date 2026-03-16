import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});
}

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalPrice => _items.fold(0, (sum, item) => sum + (item.product.effectivePrice * item.quantity));

  final ApiClient _apiClient = ApiClient();
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  void addToCart(Product product) {
    final index = _items.indexWhere((i) => i.product.id == product.id);
    if (index != -1) {
      _items[index].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  Future<bool> checkout() async {
    if (_items.isEmpty) return false;
    
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await _apiClient.dio.post('/api/orders', data: {
        'items': _items.map((i) => {
          'productId': i.product.id,
          'quantity': i.quantity,
          'price': i.product.effectivePrice,
        }).toList(),
        'totalAmount': totalPrice,
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        clearCart();
        return true;
      }
    } catch (e) {
      print("Checkout error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  void removeFromCart(String productId) {
    _items.removeWhere((i) => i.product.id == productId);
    notifyListeners();
  }

  void updateQuantity(String productId, int delta) {
    final index = _items.indexWhere((i) => i.product.id == productId);
    if (index != -1) {
      _items[index].quantity += delta;
      if (_items[index].quantity <= 0) {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
