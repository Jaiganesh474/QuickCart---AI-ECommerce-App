import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/app_colors.dart';
import 'order_success_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: cart.items.isEmpty
        ? _buildEmptyCart(context)
        : Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) => _buildCartItem(context, cart.items[index], cart),
                ),
              ),
              _buildCheckoutSummary(context, cart),
            ],
          ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: AppColors.slate200),
          const SizedBox(height: 20),
          const Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.slate)),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
            child: const Text('Start Shopping'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(BuildContext context, CartItem item, CartProvider cart) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: item.product.imageUrl != null 
              ? Image.network(item.product.imageUrl!, fit: BoxFit.contain)
              : const Icon(Icons.image, color: AppColors.slate),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('₹${item.product.effectivePrice.toInt()}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.orange)),
              ],
            ),
          ),
          Column(
            children: [
              IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20), onPressed: () => cart.removeFromCart(item.product.id)),
              Row(
                children: [
                  _buildQtyBtn(Icons.remove, () => cart.updateQuantity(item.product.id, -1)),
                  const SizedBox(width: 10),
                  Text(item.quantity.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 10),
                  _buildQtyBtn(Icons.add, () => cart.updateQuantity(item.product.id, 1)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQtyBtn(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 16),
      ),
    );
  }

  Widget _buildCheckoutSummary(BuildContext context, CartProvider cart) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Items (${cart.totalItems})', style: const TextStyle(color: AppColors.slate)),
              Text('₹${cart.totalPrice.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Delivery', style: TextStyle(color: AppColors.slate)),
              Text('FREE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total Amount', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('₹${cart.totalPrice.toInt()}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.orange)),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: cart.isLoading ? null : () async {
                final auth = Provider.of<AuthProvider>(context, listen: false);
                if (auth.user == null) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please login to checkout')));
                  return;
                }
                
                final success = await cart.checkout();
                if (success) {
                  if (context.mounted) {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const OrderSuccessScreen()));
                  }
                } else {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to place order')));
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF97316),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: cart.isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Proceed to Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
