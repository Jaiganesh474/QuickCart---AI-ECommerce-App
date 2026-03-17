import '../core/api_client.dart';

class Category {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  final List<SubCategory>? subCategories;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.subCategories,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: json['name'] ?? '',
      imageUrl: _processImageUrl(json['image']),
      subCategories: (json['subCategories'] as List?)
          ?.map((item) => SubCategory.fromJson(item))
          .toList(),
    );
  }
}

class SubCategory {
  final String id;
  final String name;

  SubCategory({required this.id, required this.name});

  factory SubCategory.fromJson(Map<String, dynamic> json) {
    return SubCategory(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: json['name'] ?? '',
    );
  }
}

String? _processImageUrl(dynamic imageJson) {
  if (imageJson == null) {
    return null;
  }
  String? img = imageJson is String ? imageJson : imageJson['url'];
  if (img != null && !img.startsWith('http')) {
    img = '${ApiClient.baseUrl}$img';
  }
  return img;
}
