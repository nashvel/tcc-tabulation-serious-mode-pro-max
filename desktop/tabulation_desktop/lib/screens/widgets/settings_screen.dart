import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../theme/app_theme.dart';
import '../../widgets/podium_loader.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _currentPinController = TextEditingController();
  final _newPinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  bool _isChangingPin = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _currentPinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  Future<void> _handleChangePin() async {
    setState(() { _errorMessage = null; _successMessage = null; });

    if (_currentPinController.text.isEmpty || _newPinController.text.isEmpty || _confirmPinController.text.isEmpty) {
      setState(() => _errorMessage = 'All fields are required');
      return;
    }
    if (_newPinController.text.length != 6) {
      setState(() => _errorMessage = 'PIN must be exactly 6 digits');
      return;
    }
    if (_newPinController.text != _confirmPinController.text) {
      setState(() => _errorMessage = 'PINs do not match');
      return;
    }

    setState(() => _isChangingPin = true);
    try {
      final response = await http.post(
        Uri.parse('http://localhost:8000/api/admin/change-pin'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'old_pin': _currentPinController.text,
          'new_pin': _newPinController.text,
          'new_pin_confirmation': _confirmPinController.text,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        setState(() => _successMessage = 'PIN changed successfully');
        _currentPinController.clear();
        _newPinController.clear();
        _confirmPinController.clear();
      } else {
        final data = jsonDecode(response.body);
        setState(() => _errorMessage = data['message'] ?? 'Failed to change PIN');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Connection error');
    } finally {
      setState(() => _isChangingPin = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Change Admin PIN', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: AppSpacing.sm),
          Text('Default PIN is 123456', style: AppTextStyles.small),
          const SizedBox(height: AppSpacing.lg),
          // Form
          Container(
            constraints: const BoxConstraints(maxWidth: 300),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPinField('Current PIN', _currentPinController),
                const SizedBox(height: AppSpacing.md),
                _buildPinField('New PIN', _newPinController),
                const SizedBox(height: AppSpacing.md),
                _buildPinField('Confirm PIN', _confirmPinController),
                const SizedBox(height: AppSpacing.lg),
                // Messages
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: Text(_errorMessage!, style: AppTextStyles.small.copyWith(color: Colors.red)),
                  ),
                if (_successMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: Text(_successMessage!, style: AppTextStyles.small.copyWith(color: Colors.green)),
                  ),
                // Button
                GestureDetector(
                  onTap: _isChangingPin ? null : _handleChangePin,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: _isChangingPin ? AppColors.disabled : AppColors.text,
                      borderRadius: AppBorders.radius,
                    ),
                    child: _isChangingPin
                        ? const SizedBox(width: 60, height: 14, child: Center(child: PodiumLoader(size: 12)))
                        : Text('Change PIN', style: AppTextStyles.button.copyWith(color: Colors.white, fontSize: 11)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPinField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.small),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
          child: TextField(
            controller: controller,
            obscureText: true,
            maxLength: 6,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
            style: AppTextStyles.body,
            decoration: const InputDecoration(
              hintText: '••••••',
              hintStyle: TextStyle(color: AppColors.disabled, fontSize: 12),
              border: InputBorder.none,
              counterText: '',
              contentPadding: EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            ),
          ),
        ),
      ],
    );
  }
}
