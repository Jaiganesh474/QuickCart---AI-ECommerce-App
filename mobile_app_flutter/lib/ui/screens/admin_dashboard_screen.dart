import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  String _activeTab = 'dashboard';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () => Navigator.pop(context),
          )
        ],
      ),
      body: _buildActiveContent(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _getTabIndex(_activeTab),
        onTap: (index) => setState(() => _activeTab = _getTabId(index)),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.orange,
        unselectedItemColor: AppColors.slate,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), label: 'Products'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.image_outlined), label: 'Banners'),
        ],
      ),
    );
  }

  int _getTabIndex(String id) {
    switch (id) {
      case 'dashboard': return 0;
      case 'products': return 1;
      case 'orders': return 2;
      case 'banners': return 3;
      default: return 0;
    }
  }

  String _getTabId(int index) {
    switch (index) {
      case 0: return 'dashboard';
      case 1: return 'products';
      case 2: return 'orders';
      case 3: return 'banners';
      default: return 'dashboard';
    }
  }

  Widget _buildActiveContent() {
    switch (_activeTab) {
      case 'dashboard':
        return _buildDashboardOverview();
      case 'products':
        return const Center(child: Text('Product Management Screen'));
      default:
        return const Center(child: Text('Coming Soon'));
    }
  }

  Widget _buildDashboardOverview() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Performance Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.5,
            children: [
              _buildStatCard('Total Sales', '₹45,230', Icons.payments_outlined, Colors.green),
              _buildStatCard('Orders', '124', Icons.shopping_cart_outlined, Colors.blue),
              _buildStatCard('Customers', '1,204', Icons.people_outline, Colors.purple),
              _buildStatCard('Products', '42', Icons.inventory_2_outlined, Colors.orange),
            ],
          ),
          const SizedBox(height: 32),
          const Text('Recent Orders', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildRecentOrdersList(),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: AppColors.slate)),
              Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentOrdersList() {
    return Column(
      children: List.generate(5, (index) => _buildOrderItem(index)),
    );
  }

  Widget _buildOrderItem(int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          const CircleAvatar(backgroundColor: Color(0xFFF8FAFC), child: Icon(Icons.person_outline, color: AppColors.slate)),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Order #1234', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('John Doe • 2 items', style: TextStyle(fontSize: 12, color: AppColors.slate)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
            child: const Text('PENDING', style: TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

class ListAction extends StatelessWidget {
  final Widget leading;
  final Widget title;
  final VoidCallback onTap;
  final bool selected;
  const ListAction({super.key, required this.leading, required this.title, required this.onTap, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: leading,
      title: title,
      onTap: onTap,
      selected: selected,
      selectedTileColor: Colors.orange.withOpacity(0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
  }
}
