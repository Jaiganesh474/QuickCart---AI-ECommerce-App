import 'product.dart';

class Order {
  final String id;
  final String orderId;
  final List<OrderItem> items;
  final double totalAmount;
  final double discountAmount;
  final double marketplaceFee;
  final double finalAmount;
  final String status;
  final DateTime createdAt;
  final String paymentMethod;
  final Map<String, dynamic>? deliveryAddress;
  final Map<String, dynamic>? user;

  Order({
    required this.id,
    required this.orderId,
    required this.items,
    required this.totalAmount,
    required this.discountAmount,
    required this.marketplaceFee,
    required this.finalAmount,
    required this.status,
    required this.createdAt,
    required this.paymentMethod,
    this.deliveryAddress,
    this.user,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id']?.toString() ?? '',
      orderId: json['orderId'] ?? 'ORD-${json['id']}',
      items: (json['items'] as List?)?.map((i) => OrderItem.fromJson(i)).toList() ?? [],
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      marketplaceFee: (json['marketplaceFee'] as num?)?.toDouble() ?? 0.0,
      finalAmount: (json['finalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'PENDING',
      createdAt: json['orderDate'] != null ? DateTime.parse(json['orderDate']) : DateTime.now(),
      paymentMethod: json['paymentMethod'] ?? 'COD',
      deliveryAddress: json['deliveryAddress'],
      user: json['user'],
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
      productId: json['product'] != null ? json['product']['id']?.toString() ?? '' : '',
      name: json['product'] != null ? json['product']['name'] ?? 'Product' : 'Product',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['product'] != null ? json['product']['imageUrl'] : null,
    );
  }
}
