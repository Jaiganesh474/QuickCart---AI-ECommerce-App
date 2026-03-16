import '../core/api_client.dart';

class Category {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    String? img = json['imageUrl'];
    if (img != null && !img.startsWith('http')) {
      img = '${ApiClient.baseUrl}$img';
    }
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      imageUrl: img,
    );
  }
}

class SubCategory {
  final String id;
  final String name;
  final String? description;
  final String categoryId;

  SubCategory({
    required this.id,
    required this.name,
    this.description,
    required this.categoryId,
  });

  factory SubCategory.fromJson(Map<String, dynamic> json) {
    return SubCategory(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      categoryId: json['category']?['id']?.toString() ?? '',
    );
  }
}
