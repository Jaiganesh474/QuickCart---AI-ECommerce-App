import 'product.dart';

class Order {
  final String id;
  final List<OrderItem> items;
  final double totalAmount;
  final String status;
  final DateTime createdAt;
  final String shippingAddress;

  Order({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    required this.shippingAddress,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id']?.toString() ?? '',
      items: (json['items'] as List?)?.map((i) => OrderItem.fromJson(i)).toList() ?? [],
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'PENDING',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      shippingAddress: json['shippingAddress'] ?? 'N/A',
    );
  }
}

class OrderItem {
  final String productId;
  final String name;
  final int quantity;
  final double price;
  final String? imageUrl;

  OrderItem({
    required this.productId,
    required this.name,
    required this.quantity,
    required this.price,
    this.imageUrl,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId']?.toString() ?? '',
      name: json['name'] ?? 'Product',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['imageUrl'],
    );
  }
}
