import '../core/api_client.dart';
import 'category.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double offerPercentage;
  final double effectivePrice;
  final int stockQuantity;
  final String? imageUrl;
  final String? brand;
  final bool isDailyOffer;
  final Category? category;
  final SubCategory? subCategory;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.offerPercentage = 0,
    required this.effectivePrice,
    required this.stockQuantity,
    this.imageUrl,
    this.brand,
    this.isDailyOffer = false,
    this.category,
    this.subCategory,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    String? img = json['imageUrl'];
    if (img != null && !img.startsWith('http')) {
      img = '${ApiClient.baseUrl}$img';
    }
    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      offerPercentage: (json['offerPercentage'] as num?)?.toDouble() ?? 0.0,
      effectivePrice: (json['effectivePrice'] as num?)?.toDouble() ?? 0.0,
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 0,
      imageUrl: img,
      brand: json['brand'],
      isDailyOffer: json['dailyOffer'] ?? false,
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
      subCategory: json['subCategory'] != null ? SubCategory.fromJson(json['subCategory']) : null,
    );
  }
}
