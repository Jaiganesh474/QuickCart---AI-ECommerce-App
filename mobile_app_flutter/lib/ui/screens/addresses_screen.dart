import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/app_colors.dart';
import '../../core/api_client.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    try {
      final response = await _apiClient.dio.get('/api/addresses');
      setState(() {
        _addresses = response.data;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint("Error fetching addresses: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteAddress(int id) async {
    try {
      await _apiClient.dio.delete('/api/addresses/$id');
      _fetchAddresses();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to delete address")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Shipping Addresses', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddressModal(),
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _addresses.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _addresses.length,
              itemBuilder: (context, index) {
                final addr = _addresses[index];
                return _buildAddressCard(addr);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off_outlined, size: 80, color: AppColors.slate200),
          const SizedBox(height: 16),
          const Text('No addresses found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.slate)),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => _showAddressModal(),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Add New Address'),
          )
        ],
      ),
    );
  }

  Widget _buildAddressCard(Map<String, dynamic> addr) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: addr['isDefault'] == true ? Colors.orange : const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(addr['fullName'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              if (addr['isDefault'] == true)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: Colors.orange[50], borderRadius: BorderRadius.circular(4)),
                  child: const Text('DEFAULT', style: TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(addr['streetAddress'] ?? '', style: const TextStyle(color: AppColors.slate600)),
          Text("${addr['city']}, ${addr['zipCode']}", style: const TextStyle(color: AppColors.slate600)),
          Text(addr['phoneNumber'] ?? '', style: const TextStyle(color: AppColors.slate600)),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _deleteAddress(addr['id']),
                child: const Text('Delete', style: TextStyle(color: Colors.red)),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () => _showAddressModal(address: addr),
                child: const Text('Edit', style: TextStyle(color: Colors.blue)),
              ),
              const SizedBox(width: 8),
              if (addr['isDefault'] != true)
                ElevatedButton(
                  onPressed: () async {
                    await _apiClient.dio.post('/api/addresses/${addr['id']}/set-default');
                    _fetchAddresses();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E293B), foregroundColor: Colors.white),
                  child: const Text('Set as Default'),
                ),
            ],
          )
        ],
      ),
    );
  }

  void _showAddressModal({Map<String, dynamic>? address}) {
    final nameController = TextEditingController(text: address?['fullName']);
    final streetController = TextEditingController(text: address?['streetAddress']);
    final cityController = TextEditingController(text: address?['city']);
    final zipController = TextEditingController(text: address?['zipCode']);
    final phoneController = TextEditingController(text: address?['phoneNumber']);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(address == null ? 'Add New Address' : 'Edit Address', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            _buildDialogField('Full Name', nameController),
            _buildDialogField('Street Address', streetController),
            Row(
              children: [
                Expanded(child: _buildDialogField('City', cityController)),
                const SizedBox(width: 12),
                Expanded(child: _buildDialogField('Zip Code', zipController)),
              ],
            ),
            _buildDialogField('Phone Number', phoneController),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () async {
                  final data = {
                    'fullName': nameController.text,
                    'streetAddress': streetController.text,
                    'city': cityController.text,
                    'zipCode': zipController.text,
                    'phoneNumber': phoneController.text,
                  };
                  if (address == null) {
                    await _apiClient.dio.post('/api/addresses', data: data);
                  } else {
                    await _apiClient.dio.put('/api/addresses/${address['id']}', data: data);
                  }
                  if (mounted) Navigator.pop(context);
                  _fetchAddresses();
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
                child: Text(address == null ? 'Save Address' : 'Update Address'),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDialogField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }
}
