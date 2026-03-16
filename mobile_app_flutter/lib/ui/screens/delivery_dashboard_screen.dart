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

  @override
  Widget build(BuildContext context) {
    final delivery = Provider.of<DeliveryProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF007185),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh), 
            onPressed: () => delivery.fetchDeliveryData()
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => delivery.fetchDeliveryData(),
        child: delivery.isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAgentStatus(),
                  const SizedBox(height: 24),
                  Text('Active Orders (${delivery.activeOrder != null ? 1 : 0})', 
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (delivery.activeOrder != null) 
                    _buildDeliveryCard(delivery.activeOrder!, delivery)
                  else
                    const Center(child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('No active order. Pick one from the list!', style: TextStyle(color: AppColors.slate)),
                    )),
                  const SizedBox(height: 32),
                  Text('Available Tasks (${delivery.availableTasks.length})', 
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildTaskList(delivery.availableTasks),
                ],
              ),
            ),
      ),
    );
  }

  Widget _buildAgentStatus() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF007185), Color(0xFF004D5A)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Earnings Today', style: TextStyle(color: Colors.white70, fontSize: 13)),
              Text('₹ 1,240', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Completed', style: TextStyle(color: Colors.white70, fontSize: 13)),
              Text('8', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(DeliveryOrder order, DeliveryProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange, width: 2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.orange),
              const SizedBox(width: 8),
              Expanded(child: Text(order.address, style: const TextStyle(fontWeight: FontWeight.bold))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(4)),
                child: Text(order.status, style: const TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Order #${order.id.substring(0, 8)}', style: const TextStyle(color: AppColors.slate)),
              ElevatedButton(
                onPressed: () => provider.updateOrderStatus(order.id, 'DELIVERED'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF007185), foregroundColor: Colors.white),
                child: const Text('Mark Delivered'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTaskList(List<DeliveryOrder> tasks) {
    if (tasks.isEmpty) return const Text('No pending tasks available.');
    return Column(
      children: tasks.map((task) => _buildTaskItem(task)).toList(),
    );
  }

  Widget _buildTaskItem(DeliveryOrder task) {
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
                const Text('Pick up Order', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Address: ${task.address}', maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: AppColors.slate)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.slate),
        ],
      ),
    );
  }
}
