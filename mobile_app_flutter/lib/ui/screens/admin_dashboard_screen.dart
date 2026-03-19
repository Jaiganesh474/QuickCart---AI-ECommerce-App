import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../core/api_client.dart';
import '../../models/order.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final ApiClient _apiClient = ApiClient();
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
        return _buildProductManagement();
      case 'orders':
        return _buildOrderManagement();
      case 'banners':
        return _buildBannerManagement();
      default:
        return _buildDashboardOverview();
    }
  }

  Widget _buildProductManagement() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add),
                label: const Text('Add'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: 10,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemBuilder: (context, index) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.slate100),
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(color: AppColors.slate50, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.inventory_2, color: AppColors.slate),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Premium Product Name', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('In Stock: 42 • Electronics', style: TextStyle(fontSize: 12, color: AppColors.slate)),
                      ],
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.edit_outlined), onPressed: () {}),
                  IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), onPressed: () {}),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  List<Order> _allOrders = [];
  bool _ordersLoading = false;
  String _orderFilter = 'LIVE'; // LIVE, CANCEL_REQUEST, DELIVERED, CANCELLED

  Future<void> _fetchAllOrders() async {
    setState(() => _ordersLoading = true);
    try {
      final response = await _apiClient.dio.get('/api/orders/all');
      if (response.statusCode == 200) {
        final List data = response.data;
        setState(() => _allOrders = data.map((json) => Order.fromJson(json)).toList());
      }
    } catch (e) {
      debugPrint('Error fetching admin orders: $e');
    } finally {
      setState(() => _ordersLoading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await _apiClient.dio.put('/api/orders/$id/status', queryParameters: {'status': status});
      _fetchAllOrders();
    } catch (e) {
      debugPrint('Error updating status: $e');
    }
  }

  Widget _buildOrderManagement() {
    if (_allOrders.isEmpty && !_ordersLoading) _fetchAllOrders();

    final filtered = _allOrders.where((o) {
      if (_orderFilter == 'LIVE') return o.status != 'DELIVERED' && o.status != 'CANCELLED';
      if (_orderFilter == 'CANCEL_REQUEST') return o.status == 'CANCEL_REQUEST' || o.status == 'CANCELLED';
      if (_orderFilter == 'DELIVERED') return o.status == 'DELIVERED';
      return o.status == 'CANCELLED';
    }).toList();

    return Column(
      children: [
        _buildOrderFilters(),
        Expanded(
          child: _ordersLoading 
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _fetchAllOrders,
                child: ListView.builder(
                  itemCount: filtered.length,
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) => _buildAdminOrderCard(filtered[index]),
                ),
              ),
        ),
      ],
    );
  }

  Widget _buildOrderFilters() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          _filterChip('LIVE', 'Live Orders'),
          _filterChip('CANCEL_REQUEST', 'Cancel Requests'),
          _filterChip('DELIVERED', 'Delivered'),
          _filterChip('CANCELLED', 'Cancelled'),
        ],
      ),
    );
  }

  Widget _filterChip(String id, String label) {
    final active = _orderFilter == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: active,
        selectedColor: Colors.orange,
        labelStyle: TextStyle(color: active ? Colors.white : Colors.black),
        onSelected: (v) => setState(() => _orderFilter = id),
      ),
    );
  }

  Widget _buildAdminOrderCard(Order order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.slate100),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('ORD-${order.orderId}', style: const TextStyle(fontWeight: FontWeight.bold)),
              DropdownButton<String>(
                value: order.status,
                items: ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
                    .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 10)))).toList(),
                onChanged: (v) {
                  if (v != null) _updateStatus(order.id!, v);
                },
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('User: ${order.user?['name'] ?? "Guest"}', style: const TextStyle(color: AppColors.slate, fontSize: 13)),
              Text('₹${order.totalAmount.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBannerManagement() {
    return const Center(child: Text('Banner Management Coming Soon'));
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
