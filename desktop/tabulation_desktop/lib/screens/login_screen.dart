import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rflutter_alert/rflutter_alert.dart';
import 'home_screen.dart';
import 'widgets/welcome_panel.dart';
import 'widgets/about_panel.dart';
import 'widgets/login_form.dart';
import 'widgets/dev_runner_panel.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _pinController = TextEditingController();
  bool _isLoading = false;
  bool _showAbout = false;
  bool _showDevRunner = false;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_pinController.text.isEmpty || _pinController.text.length < 4) {
      _showAlert(
        type: AlertType.warning,
        title: 'Invalid Input',
        desc: 'Please enter a valid PIN (at least 4 digits)',
        color: Colors.orange,
      );
      return;
    }

    setState(() => _isLoading = true);
    
    final result = await AuthService.adminLogin(_pinController.text);

    if (mounted) {
      setState(() => _isLoading = false);
      
      if (result['success']) {
        _showAlert(
          type: AlertType.success,
          title: 'Welcome Admin!',
          desc: 'Login successful',
          color: Colors.green,
          onConfirm: () {
            Navigator.pop(context);
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          },
        );
      } else {
        _showAlert(
          type: AlertType.error,
          title: 'Login Failed',
          desc: result['message'],
          color: Colors.red,
        );
      }
    }
  }

  void _showAlert({
    required AlertType type,
    required String title,
    required String desc,
    required Color color,
    VoidCallback? onConfirm,
  }) {
    final alertDialog = Alert(
      context: context,
      type: type,
      title: title,
      desc: desc,
      buttons: [
        DialogButton(
          child: Text(
            'OK',
            style: GoogleFonts.inter(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          onPressed: onConfirm ?? () => Navigator.pop(context),
          color: color,
        ),
      ],
    );
    
    alertDialog.show();
    
    // Allow Enter key to close alert
    Future.delayed(const Duration(milliseconds: 50), () {
      if (mounted) {
        ServicesBinding.instance.keyboard.addHandler(_handleAlertKeyPress);
      }
    });
  }

  bool _handleAlertKeyPress(KeyEvent event) {
    if (event.logicalKey == LogicalKeyboardKey.enter) {
      Navigator.pop(context);
      ServicesBinding.instance.keyboard.removeHandler(_handleAlertKeyPress);
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      body: Container(
        color: Colors.grey.shade100,
        child: isMobile
            ? Container(
                color: Colors.white,
                child: Stack(
                  children: [
                    // Main content
                    Center(
                      child: SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: SizedBox(
                            width: 320,
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 400),
                              transitionBuilder: (child, animation) {
                                return FadeTransition(
                                  opacity: animation,
                                  child: SlideTransition(
                                    position: Tween<Offset>(
                                      begin: const Offset(0, 0.1),
                                      end: Offset.zero,
                                    ).animate(animation),
                                    child: child,
                                  ),
                                );
                              },
                              child: _showDevRunner
                                  ? const DevRunnerPanel(
                                      key: ValueKey('devRunner'),
                                    )
                                  : LoginForm(
                                      key: const ValueKey('login'),
                                      pinController: _pinController,
                                      isLoading: _isLoading,
                                      onLogin: _handleLogin,
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    // Arrow button (top-right on mobile) - positioned last so it's on top
                    Positioned(
                      right: 16,
                      top: 16,
                      child: Tooltip(
                        message: _showDevRunner ? 'Back to Login' : 'Development Runner',
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              setState(() => _showDevRunner = !_showDevRunner);
                            },
                            borderRadius: BorderRadius.circular(50),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(50),
                                border: Border.all(
                                  color: Colors.blue.shade200,
                                  width: 2,
                                ),
                              ),
                              child: Icon(
                                _showDevRunner
                                    ? Icons.arrow_back_ios
                                    : Icons.arrow_forward_ios,
                                color: Colors.blue,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : Row(
                children: [
                  // Left Panel - Blue (desktop only)
                  Expanded(
                    flex: 1,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeInOut,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: _showAbout
                              ? [
                                  Colors.purple.shade700,
                                  Colors.purple.shade500,
                                ]
                              : [
                                  Colors.blue.shade700,
                                  Colors.blue.shade500,
                                ],
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 48.0, vertical: 24.0),
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 400),
                          transitionBuilder: (child, animation) {
                            return FadeTransition(
                              opacity: animation,
                              child: SlideTransition(
                                position: Tween<Offset>(
                                  begin: const Offset(0, 0.1),
                                  end: Offset.zero,
                                ).animate(animation),
                                child: child,
                              ),
                            );
                          },
                          child: _showAbout
                              ? AboutPanel(
                                  onBack: () => setState(() => _showAbout = false),
                                )
                              : WelcomePanel(
                                  onLearnMore: () =>
                                      setState(() => _showAbout = true),
                                ),
                        ),
                      ),
                    ),
                  ),

                  // Right Panel - White
                  Expanded(
                    flex: 1,
                    child: Container(
                      color: Colors.white,
                      child: Stack(
                        children: [
                          // Arrow button (center-right)
                          Positioned(
                            right: 0,
                            top: 0,
                            bottom: 0,
                            child: Center(
                              child: Tooltip(
                                message: _showDevRunner ? 'Back to Login' : 'Development Runner',
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() => _showDevRunner = !_showDevRunner);
                                  },
                                  child: Container(
                                    margin: const EdgeInsets.only(right: 16),
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(50),
                                      border: Border.all(
                                        color: Colors.blue.shade200,
                                        width: 2,
                                      ),
                                    ),
                                    child: Icon(
                                      _showDevRunner
                                          ? Icons.arrow_back_ios
                                          : Icons.arrow_forward_ios,
                                      color: Colors.blue,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          // Main content
                          Center(
                            child: SingleChildScrollView(
                              child: Padding(
                                padding: const EdgeInsets.all(48.0),
                                child: SizedBox(
                                  width: 320,
                                  child: AnimatedSwitcher(
                                    duration: const Duration(milliseconds: 400),
                                    transitionBuilder: (child, animation) {
                                      return FadeTransition(
                                        opacity: animation,
                                        child: SlideTransition(
                                          position: Tween<Offset>(
                                            begin: const Offset(0, 0.1),
                                            end: Offset.zero,
                                          ).animate(animation),
                                          child: child,
                                        ),
                                      );
                                    },
                                    child: _showDevRunner
                                        ? const DevRunnerPanel(
                                            key: ValueKey('devRunner'),
                                          )
                                        : LoginForm(
                                            key: const ValueKey('login'),
                                            pinController: _pinController,
                                            isLoading: _isLoading,
                                            onLogin: _handleLogin,
                                          ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

}
