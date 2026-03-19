import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

import 'edit_profile_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkTheme = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection('Account Settings'),
          _buildItem(Icons.person_outline, 'Edit Profile', () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()));
          }),
          _buildItem(Icons.notifications_outlined, 'Notification Preferences', () {}),
          _buildItem(Icons.lock_outline, 'Privacy & Security', () {}),
          const SizedBox(height: 24),
          _buildSection('App Settings'),
          _buildItem(Icons.language_outlined, 'App Language', () {}),
          _buildItem(Icons.dark_mode_outlined, 'Dark Theme', null, 
            trailing: Switch(
              value: _darkTheme, 
              onChanged: (v) => setState(() => _darkTheme = v),
              activeColor: Colors.orange,
            )
          ),
          _buildItem(Icons.help_outline, 'Help & Support', () {}),
          _buildItem(Icons.info_outline, 'About QuickCart', () {}),
          const SizedBox(height: 32),
          const Text(
            'QuickCart v1.0.0',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.slate300, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.orange, letterSpacing: 1.1),
      ),
    );
  }

  Widget _buildItem(IconData icon, String title, VoidCallback? onTap, {Widget? trailing}) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: const Color(0xFF1E293B), size: 18),
      ),
      title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.normal)),
      trailing: trailing ?? const Icon(Icons.chevron_right, color: AppColors.slate200, size: 20),
      onTap: onTap,
    );
  }
}
