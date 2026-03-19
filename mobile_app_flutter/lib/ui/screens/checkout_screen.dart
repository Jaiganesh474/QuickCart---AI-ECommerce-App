import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/api_client.dart';
import '../../core/app_colors.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late Razorpay _razorpay;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipController = TextEditingController();

  List<dynamic> _savedAddresses = [];
  bool _addressesLoading = false;

  Future<void> _fetchSavedAddresses() async {
    setState(() => _addressesLoading = true);
    try {
      final response = await ApiClient().dio.get('/api/addresses');
      if (response.statusCode == 200) {
        setState(() => _savedAddresses = response.data);
        // Pre-fill with default address if exists
        final def = _savedAddresses.firstWhere((a) => a['isDefault'] == true, orElse: () => null);
        if (def != null) _fillFromAddress(def);
      }
    } catch (e) {
      debugPrint('Error fetching saved addresses: $e');
    } finally {
      setState(() => _addressesLoading = false);
    }
  }

  void _fillFromAddress(Map<String, dynamic> addr) {
    setState(() {
      _nameController.text = addr['fullName'] ?? '';
      _phoneController.text = addr['phoneNumber'] ?? '';
      _addressController.text = addr['streetAddress'] ?? '';
      _cityController.text = addr['city'] ?? '';
      _zipController.text = addr['zipCode'] ?? '';
    });
  }

  @override
  void initState() {
    super.initState();
    _fetchSavedAddresses();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
    
    // Prefill user details if available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.user != null) {
        if (_nameController.text.isEmpty) _nameController.text = auth.user!.name;
        if (_phoneController.text.isEmpty) _phoneController.text = auth.user!.mobileNumber ?? '';
      }
    });
  }

  @override
  void dispose() {
    _razorpay.clear();
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _zipController.dispose();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: Colors.orange)),
    );

    final cart = Provider.of<CartProvider>(context, listen: false);
    
    final shippingDetails = {
      'fullName': _nameController.text,
      'phoneNumber': _phoneController.text,
      'streetAddress': _addressController.text,
      'city': _cityController.text,
      'zipCode': _zipController.text,
      'country': 'India',
    };

    try {
      final success = await cart.checkout(
        paymentMethod: 'RAZORPAY',
        shippingAddress: shippingDetails,
        paymentId: response.paymentId,
      );
      
      if (mounted) Navigator.pop(context); // Close loading indicator

      if (success) {
        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const OrderSuccessScreen()),
            (route) => false,
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Order failed on backend. Please contact support.'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) Navigator.pop(context); // Close loading indicator
      debugPrint("Checkout error: $e");
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Payment Failed: ${response.message}'), backgroundColor: Colors.red),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('External Wallet: ${response.walletName}')),
    );
  }

  void _startPayment() {
    final cart = Provider.of<CartProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    
    if (_nameController.text.isEmpty || _phoneController.text.isEmpty || 
        _addressController.text.isEmpty || _cityController.text.isEmpty || _zipController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all address details')));
      return;
    }

    var options = {
      'key': 'rzp_test_SOO8Ni1ctYOgwL', // Standard test key - replace with real if needed
      'amount': (cart.totalPrice * 100).toInt(), 
      'name': 'QuickCart',
      'description': 'Order Payment',
      'prefill': {
        'contact': _phoneController.text,
        'email': auth.user?.email ?? '',
      },
      'external': {
        'wallets': ['paytm']
      }
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error starting Razorpay: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                if (_savedAddresses.isNotEmpty) ...[
                  _buildSectionTitle('Saved Addresses'),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _savedAddresses.length,
                      itemBuilder: (context, index) {
                        final addr = _savedAddresses[index];
                        final isSelected = _addressController.text == addr['streetAddress'];
                        return GestureDetector(
                          onTap: () => _fillFromAddress(addr),
                          child: Container(
                            width: 220,
                            margin: const EdgeInsets.only(right: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: isSelected ? Colors.orange : const Color(0xFFF1F5F9), width: 2),
                              boxShadow: isSelected ? [BoxShadow(color: Colors.orange.withOpacity(0.1), blurRadius: 8)] : null,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(addr['fullName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1),
                                const SizedBox(height: 4),
                                Text(addr['streetAddress'], style: const TextStyle(fontSize: 11, color: AppColors.slate), maxLines: 2),
                                Text(addr['city'], style: const TextStyle(fontSize: 11, color: AppColors.slate)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
                _buildSectionTitle('Shipping Details'),
                const SizedBox(height: 12),
                _buildTextField('Full Name', _nameController),
                const SizedBox(height: 12),
                _buildTextField('Phone Number', _phoneController, keyboardType: TextInputType.phone),
                const SizedBox(height: 12),
                _buildTextField('Street Address', _addressController),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildTextField('City', _cityController)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildTextField('Zip Code', _zipController, keyboardType: TextInputType.number)),
                  ],
                ),
                const SizedBox(height: 32),
                _buildSectionTitle('Order Summary'),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                  ),
                  child: Column(
                    children: [
                      ...cart.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('${item.quantity}x ${item.product.name}', style: const TextStyle(fontSize: 13)),
                            Text('₹${(item.product.effectivePrice * item.quantity).toInt()}'),
                          ],
                        ),
                      )),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('₹${cart.totalPrice.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.orange)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          _buildPayButton(),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.slate800));
  }

  Widget _buildTextField(String label, TextEditingController controller, {TextInputType? keyboardType}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.slate200)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.slate200)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _buildPayButton() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 55,
        child: ElevatedButton(
          onPressed: _startPayment,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFF97316),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 0,
          ),
          child: const Text('Complete Payment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
