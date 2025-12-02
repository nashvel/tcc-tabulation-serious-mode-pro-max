import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:rflutter_alert/rflutter_alert.dart';
import 'dart:convert';

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
  bool _showPinConfirm = false;

  @override
  void dispose() {
    _currentPinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  void _handleChangePinClick() {
    // Validate inputs
    if (_currentPinController.text.isEmpty ||
        _newPinController.text.isEmpty ||
        _confirmPinController.text.isEmpty) {
      _showError('All PIN fields are required');
      return;
    }

    if (_newPinController.text.length < 4) {
      _showError('New PIN must be at least 4 digits');
      return;
    }

    if (_newPinController.text.length > 6) {
      _showError('New PIN must not exceed 6 digits');
      return;
    }

    if (_newPinController.text != _confirmPinController.text) {
      _showError('New PIN and confirmation do not match');
      return;
    }

    // Show confirmation dialog using rflutter_alert
    Alert(
      context: context,
      type: AlertType.warning,
      title: 'Confirm PIN Change',
      desc: 'Are you sure you want to change your admin PIN?',
      buttons: [
        DialogButton(
          child: const Text(
            'Cancel',
            style: TextStyle(color: Colors.white, fontSize: 14),
          ),
          onPressed: () => Navigator.pop(context),
          color: Colors.grey,
        ),
        DialogButton(
          child: const Text(
            'Confirm',
            style: TextStyle(color: Colors.white, fontSize: 14),
          ),
          onPressed: _handleConfirmPinChange,
          color: Colors.indigo,
        ),
      ],
    ).show();
  }

  Future<void> _handleConfirmPinChange() async {
    setState(() => _isChangingPin = true);
    try {
      final adminToken = 'your_admin_token'; // Get from localStorage equivalent
      final response = await http.post(
        Uri.parse('http://localhost:8000/api/admin/change-pin'),
        headers: {
          'Authorization': 'Bearer $adminToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'old_pin': _currentPinController.text,
          'new_pin': _newPinController.text,
          'new_pin_confirmation': _confirmPinController.text,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        _showSuccess('Admin PIN changed successfully');
        setState(() => _showPinConfirm = false);

        // Clear form
        _currentPinController.clear();
        _newPinController.clear();
        _confirmPinController.clear();
      } else {
        final data = jsonDecode(response.body);
        final errorMessage = data['message'] ?? 'Failed to change PIN';

        if (errorMessage.contains('Invalid current PIN')) {
          _showError('Current PIN is incorrect');
        } else {
          _showError(errorMessage);
        }

        setState(() => _showPinConfirm = false);
      }
    } catch (error) {
      print('Error changing PIN: $error');
      _showError('Failed to change PIN');
      setState(() => _showPinConfirm = false);
    } finally {
      setState(() => _isChangingPin = false);
    }
  }

  void _showError(String message) {
    Alert(
      context: context,
      type: AlertType.error,
      title: 'Error',
      desc: message,
      buttons: [
        DialogButton(
          child: const Text(
            'OK',
            style: TextStyle(color: Colors.white, fontSize: 14),
          ),
          onPressed: () => Navigator.pop(context),
          color: Colors.red,
        ),
      ],
    ).show();
  }

  void _showSuccess(String message) {
    Alert(
      context: context,
      type: AlertType.success,
      title: 'Success',
      desc: message,
      buttons: [
        DialogButton(
          child: const Text(
            'OK',
            style: TextStyle(color: Colors.white, fontSize: 14),
          ),
          onPressed: () => Navigator.pop(context),
          color: Colors.green,
        ),
      ],
    ).show();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade50,
      child: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(24),
            child: const Text(
              'General Settings',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ListView(
                children: [
                  // Change Admin PIN Section
                  Container(
                    constraints: const BoxConstraints(maxWidth: 400),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.indigo.shade100,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.lock,
                                color: Colors.indigo.shade700,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Change Admin PIN',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Info Box
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            border: Border.all(
                              color: Colors.blue.shade200,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: Colors.blue.shade700,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Default PIN is 123456. Change it to secure your admin panel.',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.blue.shade900,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Current PIN
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Current PIN',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            TextField(
                              controller: _currentPinController,
                              obscureText: true,
                              maxLength: 6,
                              decoration: InputDecoration(
                                hintText: 'Enter current PIN',
                                isDense: true,
                                prefixIcon: Icon(
                                  Icons.lock_outline,
                                  size: 18,
                                  color: Colors.grey.shade400,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.indigo,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // New PIN
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'New PIN',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            TextField(
                              controller: _newPinController,
                              obscureText: true,
                              maxLength: 6,
                              decoration: InputDecoration(
                                hintText: 'Enter new PIN (4-6 digits)',
                                isDense: true,
                                prefixIcon: Icon(
                                  Icons.lock_outline,
                                  size: 18,
                                  color: Colors.grey.shade400,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.indigo,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // Confirm New PIN
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Confirm New PIN',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            TextField(
                              controller: _confirmPinController,
                              obscureText: true,
                              maxLength: 6,
                              decoration: InputDecoration(
                                hintText: 'Confirm new PIN',
                                isDense: true,
                                prefixIcon: Icon(
                                  Icons.lock_outline,
                                  size: 18,
                                  color: Colors.grey.shade400,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.indigo,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Change PIN Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _handleChangePinClick,
                            icon: const Icon(Icons.check_circle_outline, size: 18),
                            label: const Text('Change PIN'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.indigo,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
