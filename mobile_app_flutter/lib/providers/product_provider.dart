import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../models/product.dart';
import '../models/category.dart';

class ProductProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  List<Product> _products = [];
  List<Category> _categories = [];
  List<Product> _dailyDeals = [];
  bool _isLoading = false;

  List<Product> get products => _products;
  List<Category> get categories => _categories;
  List<Product> get dailyDeals => _dailyDeals;
  bool get isLoading => _isLoading;

  Future<void> fetchHomeData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final responses = await Future.wait([
        _apiClient.dio.get('/api/products'),
        _apiClient.dio.get('/api/categories'),
      ]);

      if (responses[0].statusCode == 200) {
        final List data = responses[0].data;
        _products = data.map((json) => Product.fromJson(json)).toList();
        _dailyDeals = _products.where((p) => p.isDailyOffer).toList();
      }

      if (responses[1].statusCode == 200) {
        final List data = responses[1].data;
        _categories = data.map((json) => Category.fromJson(json)).toList();
      }
    } catch (e) {
      print("Error fetching home data: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<Product> _searchResults = [];
  List<Product> get searchResults => _searchResults;

  Future<void> searchProducts(String query) async {
    if (query.trim().isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }
    
    // Filter locally for now, or fetch from API if there's a dedicated endpoint
    _searchResults = _products.where((p) => 
      p.name.toLowerCase().contains(query.toLowerCase()) || 
      p.description.toLowerCase().contains(query.toLowerCase())
    ).toList();
    notifyListeners();
  }

  void clearSearch() {
    _searchResults = [];
    notifyListeners();
  }

  List<Product> getProductsByCategory(String categoryId) {
    return _products.where((p) => p.category?.id == categoryId).toList();
  }
}
