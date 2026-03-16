import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../core/app_colors.dart';
import 'cart_screen.dart';

class ProductDetailsScreen extends StatelessWidget {
  final Product product;
  const ProductDetailsScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.share_outlined), onPressed: () {}),
          IconButton(icon: const Icon(Icons.favorite_border), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 350,
              width: double.infinity,
              color: const Color(0xFFF8FAFC),
              child: product.imageUrl != null 
                ? CachedNetworkImage(
                    imageUrl: product.imageUrl!,
                    fit: BoxFit.contain,
                    placeholder: (context, url) => Shimmer.fromColors(
                      baseColor: AppColors.slate50,
                      highlightColor: Colors.white,
                      child: Container(color: Colors.white),
                    ),
                    errorWidget: (context, url, error) => const Icon(Icons.error_outline, size: 50, color: AppColors.slate),
                  )
                : const Icon(Icons.image, size: 100, color: AppColors.slate),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (product.brand != null)
                    Text(product.brand!.toUpperCase(), 
                      style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Text(product.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, height: 1.3)),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      const Text('₹', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Text(product.effectivePrice.toInt().toString(), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                      if (product.offerPercentage > 0) ...[
                        const SizedBox(width: 12),
                        Text('₹${product.price.toInt()}', style: TextStyle(decoration: TextDecoration.lineThrough, color: AppColors.slate, fontSize: 16)),
                        const SizedBox(width: 8),
                        Text('${product.offerPercentage.toInt()}% OFF', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Divider(color: Color(0xFFF1F5F9)),
                  const SizedBox(height: 20),
                  const Text('Product Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Text(product.description, style: const TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.6)),
                  const SizedBox(height: 100), // Space for bottom buttons
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 50,
                child: OutlinedButton(
                  onPressed: () {
                    Provider.of<CartProvider>(context, listen: false).addToCart(product);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("${product.name} added to cart"),
                        action: SnackBarAction(label: 'View Cart', onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
                        }),
                      )
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFF97316)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Add to Cart', style: TextStyle(color: Color(0xFFF97316), fontWeight: FontWeight.bold)),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    Provider.of<CartProvider>(context, listen: false).addToCart(product);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Buy Now', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
