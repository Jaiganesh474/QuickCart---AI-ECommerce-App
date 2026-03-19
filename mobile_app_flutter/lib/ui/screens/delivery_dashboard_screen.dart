import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../providers/delivery_provider.dart';

class DeliveryDashboardScreen extends StatefulWidget {
  const DeliveryDashboardScreen({super.key});

  @override
  State<DeliveryDashboardScreen> createState() => _DeliveryDashboardScreenState();
}

class _DeliveryDashboardScreenState extends State<DeliveryDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => 
      Provider.of<DeliveryProvider>(context, listen: false).fetchDeliveryData()
    );
  }

  int _activeTabIndex = 0;

  @override
  Widget build(BuildContext context) {
    final delivery = Provider.of<DeliveryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Delivery Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: _buildTabs(),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => delivery.fetchDeliveryData(),
        child: delivery.isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _buildTabContent(delivery),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8, left: 16, right: 16),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          _tabItem(0, 'Available'),
          _tabItem(1, 'Active'),
          _tabItem(2, 'Completed'),
        ],
      ),
    );
  }

  Widget _tabItem(int index, String label) {
    final active = _activeTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: active ? Colors.orange : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(label, textAlign: TextAlign.center, style: TextStyle(color: active ? Colors.white : Colors.white70, fontWeight: FontWeight.bold, fontSize: 13)),
        ),
      ),
    );
  }

  Widget _buildTabContent(DeliveryProvider delivery) {
    if (_activeTabIndex == 0) return _buildTaskList(delivery, delivery.availableTasks);
    if (_activeTabIndex == 1) return _buildActiveOrderSection(delivery);
    return _buildCompletedList(delivery);
  }

  Widget _buildActiveOrderSection(DeliveryProvider delivery) {
    final active = delivery.activeOrder;
    if (active == null) return _buildEmptyState('No active order. Accept a task to start!');
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildOrderCard(delivery, active),
      ],
    );
  }

  Widget _buildCompletedList(DeliveryProvider delivery) {
    final completed = delivery.myOrders.where((o) => o.status == 'DELIVERED').toList();
    if (completed.isEmpty) return _buildEmptyState('No completed orders yet.');
    return ListView.builder(
      itemCount: completed.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) => _buildOrderCard(delivery, completed[index]),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate100),
      ),
      child: Center(child: Text(message, style: const TextStyle(color: AppColors.slate))),
    );
  }

  Widget _buildOrderCard(DeliveryProvider provider, DeliveryOrder order) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange, width: 2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Order #${order.id.toString().substring(0, 8).toUpperCase()}', 
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              DropdownButton<String>(
                value: ['ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'].contains(order.status) ? order.status : 'ACCEPTED',
                underline: const SizedBox(),
                items: ['ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED']
                    .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)))).toList(),
                onChanged: (v) {
                  if (v != null) provider.updateOrderStatus(order.id, v);
                },
              ),
            ],
          ),
          const Divider(height: 32),
          _infoRow(Icons.person_outline, 'Customer', order.customerName),
          const SizedBox(height: 12),
          _infoRow(Icons.location_on_outlined, 'Address', order.address),
          const SizedBox(height: 12),
          _infoRow(Icons.phone_outlined, 'Contact', order.customerPhone),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Colors.orange),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.slate, fontSize: 11)),
              Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTaskList(DeliveryProvider provider, List<DeliveryOrder> tasks) {
    if (tasks.isEmpty) return _buildEmptyState('No pending tasks available.');
    return ListView.builder(
      itemCount: tasks.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) => _buildTaskItem(provider, tasks[index]),
    );
  }

  Widget _buildTaskItem(DeliveryProvider provider, DeliveryOrder task) {
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
          const CircleAvatar(backgroundColor: Color(0xFFF0FDF4), child: Icon(Icons.local_shipping_outlined, color: Colors.green)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('New Task Available', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(task.address, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: AppColors.slate)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: provider.isLoading ? null : () async {
              final success = await provider.acceptTask(task.id);
              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task accepted successfully!')));
              } else if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to accept task')));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E293B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: provider.isLoading 
              ? const SizedBox(height: 14, width: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Accept', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
