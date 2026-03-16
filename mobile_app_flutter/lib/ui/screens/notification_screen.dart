import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildNotificationItem(
            'Order Shipped!',
            'Your order #8821 has been shipped and is on its way.',
            '2 hours ago',
            Icons.local_shipping_outlined,
            Colors.blue,
          ),
          _buildNotificationItem(
            'Big Sale is Live!',
            'Get up to 50% off on all electronics. Limited time offer!',
            '5 hours ago',
            Icons.campaign_outlined,
            Colors.orange,
          ),
          _buildNotificationItem(
            'Welcome to QuickCart',
            'Thank you for joining us. Start exploring daily deals now.',
            '1 day ago',
            Icons.celebration_outlined,
            Colors.purple,
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(String title, String desc, String time, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(color: AppColors.slate, fontSize: 13, height: 1.4)),
                const SizedBox(height: 8),
                Text(time, style: TextStyle(color: AppColors.slate.withOpacity(0.6), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
