import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../models/category.dart';
import '../../models/product.dart';
import './product_details_screen.dart';
import '../../core/app_colors.dart';

class CategoryProductsScreen extends StatelessWidget {
  final Category category;
  final List<Product> products;

  const CategoryProductsScreen({
    super.key, 
    required this.category, 
    required this.products
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(category.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: products.isEmpty 
        ? _buildEmptyState()
        : GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.7,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) => _buildProductCard(context, products[index]),
          ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 80, color: AppColors.slate200),
          const SizedBox(height: 16),
          const Text('No products found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.slate)),
          const Text('Stay tuned! New items arriving soon.', style: TextStyle(color: AppColors.slate)),
        ],
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Product product) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: product)));
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.slate100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Container(
                  width: double.infinity,
                  color: AppColors.slate50,
                  padding: const EdgeInsets.all(8),
                  child: product.imageUrl != null 
                    ? CachedNetworkImage(
                        imageUrl: product.imageUrl!,
                        fit: BoxFit.contain,
                        placeholder: (context, url) => Shimmer.fromColors(
                          baseColor: AppColors.slate50,
                          highlightColor: Colors.white,
                          child: Container(color: Colors.white),
                        ),
                        errorWidget: (context, url, error) => const Icon(Icons.image, color: AppColors.slate),
                      )
                    : const Icon(Icons.image, color: AppColors.slate),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, 
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('₹${product.effectivePrice.toInt()}', 
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange, fontSize: 15)),
                      if (product.offerPercentage > 0) ...[
                        const SizedBox(width: 4),
                        Text('₹${product.price.toInt()}', 
                          style: const TextStyle(decoration: TextDecoration.lineThrough, color: AppColors.slate, fontSize: 11)),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
