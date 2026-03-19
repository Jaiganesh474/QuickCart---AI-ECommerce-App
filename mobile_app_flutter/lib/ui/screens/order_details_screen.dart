import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/order.dart';
import '../../core/app_colors.dart';
import '../../core/api_client.dart';
import '../../providers/auth_provider.dart';

class OrderDetailsScreen extends StatefulWidget {
  final Order order;
  const OrderDetailsScreen({super.key, required this.order});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isCancelling = false;
  late Order _currentOrder;

  @override
  void initState() {
    super.initState();
    _currentOrder = widget.order;
  }

  Future<void> _cancelOrder() async {
    setState(() => _isCancelling = true);
    try {
      final response = await _apiClient.dio.post('/api/orders/${_currentOrder.id}/cancel');
      if (response.statusCode == 200) {
        setState(() {
          _currentOrder = Order.fromJson(response.data);
          _isCancelling = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cancellation request sent successfully')));
          Provider.of<AuthProvider>(context, listen: false).fetchOrders();
        }
      }
    } catch (e) {
      debugPrint("Cancel error: $e");
      setState(() => _isCancelling = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to cancel order. It might already be shipped.'), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMMM yyyy');
    
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Order Details', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          TextButton.icon(
            onPressed: () {}, 
            icon: const Icon(Icons.download, size: 18, color: Colors.orange),
            label: const Text('Invoice', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildOrderInfoBar(dateFormat),
            _buildShipPaymentSummary(),
            _buildTrackingSection(dateFormat),
            _buildProductList(),
            if (_canCancel()) _buildCancelButton(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfoBar(DateFormat df) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Ordered on ${df.format(_currentOrder.createdAt)}', style: const TextStyle(color: AppColors.slate, fontSize: 13)),
              Text('Order number ${_currentOrder.orderId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShipPaymentSummary() {
    final addr = _currentOrder.deliveryAddress;
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 1,
                child: _buildSummaryColumn('Ship to', [
                  Text(addr?['fullName'] ?? 'Customer', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.cyan)),
                  Text(addr?['streetAddress'] ?? 'N/A', style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
                  Text("${addr?['city'] ?? 'N/A'}, ${addr?['state'] ?? ''}", style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
                  const Text('India', style: TextStyle(fontSize: 12, color: AppColors.slate600)),
                ]),
              ),
              const VerticalDivider(),
              Expanded(
                flex: 1,
                child: _buildSummaryColumn('Payment method', [
                  Row(
                    children: [
                      const Icon(Icons.payment, size: 14, color: AppColors.slate),
                      const SizedBox(width: 4),
                      Text(_currentOrder.paymentMethod, style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
                    ],
                  ),
                ]),
              ),
            ],
          ),
          const Divider(height: 32),
          _buildOrderSummaryRows(),
        ],
      ),
    );
  }

  Widget _buildSummaryColumn(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildOrderSummaryRows() {
    return Column(
      children: [
        _buildPriceRow('Item(s) Subtotal:', '₹${_currentOrder.totalAmount.toInt()}'),
        _buildPriceRow('Shipping:', '₹0.00'),
        _buildPriceRow('Marketplace Fee:', '₹${_currentOrder.marketplaceFee.toInt()}'),
        if (_currentOrder.discountAmount > 0)
          _buildPriceRow('Discount:', '-₹${_currentOrder.discountAmount.toInt()}', color: Colors.green),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Grand Total:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('₹${_currentOrder.finalAmount.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.slate600)),
          Text(value, style: TextStyle(fontSize: 13, color: color ?? Colors.black)),
        ],
      ),
    );
  }

  Widget _buildTrackingSection(DateFormat df) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${_currentOrder.status} ${df.format(DateTime.now())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 4),
          const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 16),
              SizedBox(width: 4),
              Text('Standard Delivery', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Track package', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildStatusStepper(),
          const SizedBox(height: 24),
          _buildDeliveryPartnerCard(),
        ],
      ),
    );
  }

  Widget _buildStatusStepper() {
    final statusList = ['ORDERED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    int currentStep = statusList.indexOf(_currentOrder.status.toUpperCase());
    if (currentStep == -1) currentStep = 0;

    return Row(
      children: List.generate(statusList.length, (index) {
        bool isDone = index <= currentStep;
        bool isLast = index == statusList.length - 1;
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(child: Container(height: 3, color: index == 0 ? Colors.transparent : (index <= currentStep ? Colors.teal : Colors.grey[300]))),
                  Container(
                    width: 14, height: 14,
                    decoration: BoxDecoration(
                      color: isDone ? Colors.teal : Colors.white,
                      border: Border.all(color: isDone ? Colors.teal : Colors.grey[400]!, width: 2),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Expanded(child: Container(height: 3, color: isLast ? Colors.transparent : (index < currentStep ? Colors.teal : Colors.grey[300]))),
                ],
              ),
              const SizedBox(height: 8),
              Text(statusList[index].replaceAll('_', ' '), textAlign: TextAlign.center, style: TextStyle(fontSize: 8, fontWeight: isDone ? FontWeight.bold : FontWeight.normal, color: isDone ? Colors.black : Colors.grey)),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildDeliveryPartnerCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          const Icon(Icons.local_shipping_outlined, color: Colors.orange),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('DELIVERY PARTNER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.slate)),
                Text('QuickCart Logistics', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text('Tracking: Available on update', style: TextStyle(fontSize: 11, color: AppColors.slate)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductList() {
    return Column(
      children: _currentOrder.items.map((item) => _buildProductCard(item)).toList(),
    );
  }

  Widget _buildProductCard(OrderItem item) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: item.imageUrl != null ? DecorationImage(image: NetworkImage(item.imageUrl!), fit: BoxFit.cover) : null,
                  color: Colors.grey[100],
                ),
                child: item.imageUrl == null ? const Icon(Icons.image, color: Colors.grey) : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.teal)),
                    const Text('Sold by: QuickCart', style: TextStyle(fontSize: 11, color: AppColors.slate)),
                    const SizedBox(height: 8),
                    Text('₹${item.price.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('Quantity: ${item.quantity}', style: const TextStyle(fontSize: 12, color: AppColors.slate)),
                  ],
                ),
              ),
              Column(
                children: [
                  _buildProductButton('Get product support', Colors.yellow[700]!, Colors.black),
                  const SizedBox(height: 8),
                  _buildProductButton('Leave seller feedback', Colors.white, Colors.black, border: true),
                ],
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildSmallButton('View your item'),
              const SizedBox(width: 8),
              _buildSmallButton('Write a product review'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildProductButton(String label, Color bg, Color text, {bool border = false}) {
    return Container(
      width: 130,
      height: 32,
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: text,
          elevation: 0,
          side: border ? const BorderSide(color: Color(0xFFE2E8F0)) : null,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          padding: EdgeInsets.zero,
        ),
        child: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildSmallButton(String label) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  bool _canCancel() {
    final status = _currentOrder.status.toUpperCase();
    return status == 'PENDING' || status == 'CONFIRMED';
  }

  Widget _buildCancelButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton(
          onPressed: _isCancelling ? null : _cancelOrder,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red[50],
            foregroundColor: Colors.red,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.red)),
          ),
          child: _isCancelling 
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red))
            : const Text('Cancel Order', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
