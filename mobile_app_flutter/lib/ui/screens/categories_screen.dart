import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/product_provider.dart';
import '../../core/app_colors.dart';
import 'category_products_screen.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final productProvider = Provider.of<ProductProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Categories', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: productProvider.categories.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final cat = productProvider.categories[index];
          return InkWell(
            onTap: () {
              final products = productProvider.getProductsByCategory(cat.id);
              Navigator.push(context, MaterialPageRoute(
                builder: (_) => CategoryProductsScreen(category: cat, products: products)
              ));
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.category_outlined, color: Colors.orange),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(cat.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.slate300),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
