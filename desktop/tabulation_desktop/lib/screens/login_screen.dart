import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'home_screen.dart';
import 'widgets/dev_runner_panel.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _pinController = TextEditingController();
  bool _isLoading = false;
  int _selectedTab = 0; // 0 = Login, 1 = Servers
  bool _showServerHint = false; // Show tooltip pointing to Servers tab
  
  // Keep DevRunnerPanel alive across tab switches
  final GlobalKey<DevRunnerPanelState> _devRunnerKey = GlobalKey<DevRunnerPanelState>();
  
  // Animation for "ger" letters
  late AnimationController _animController;
  late Animation<double> _gAnim;
  late Animation<double> _eAnim;
  late Animation<double> _rAnim;
  
  // Animation for macbook intro
  late AnimationController _macbookAnimController;
  late Animation<double> _macbookScale;
  late Animation<double> _macbookOpacity;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    // Staggered animations for g, e, r letters
    _gAnim = Tween<double>(begin: 0, end: -8).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.0, 0.6, curve: Curves.easeOut)),
    );
    _eAnim = Tween<double>(begin: 0, end: -8).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.15, 0.75, curve: Curves.easeOut)),
    );
    _rAnim = Tween<double>(begin: 0, end: -8).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.3, 0.9, curve: Curves.easeOut)),
    );
    
    // Macbook intro animation
    _macbookAnimController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _macbookScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _macbookAnimController, curve: Curves.easeOutBack),
    );
    _macbookOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _macbookAnimController, curve: Curves.easeOut),
    );
    
    // Start animations
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _macbookAnimController.forward();
    });
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) _animController.forward();
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    _macbookAnimController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_pinController.text.isEmpty || _pinController.text.length != 6) {
      _showError('Please enter a 6-digit PIN');
      return;
    }

    setState(() => _isLoading = true);
    final result = await AuthService.adminLogin(_pinController.text);

    if (mounted) {
      setState(() => _isLoading = false);
      if (result['success']) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      } else {
        // Check if it's a connection error
        final message = result['message']?.toString().toLowerCase() ?? '';
        if (message.contains('connect') || message.contains('server') || message.contains('network') || message.contains('socket')) {
          _showServerHintTooltip();
        } else {
          _showError(result['message'] ?? 'Login failed');
        }
      }
    }
  }

  void _showServerHintTooltip() {
    setState(() => _showServerHint = true);
    // Auto-hide after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) setState(() => _showServerHint = false);
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: AppTextStyles.small.copyWith(color: Colors.white)),
        backgroundColor: AppColors.text,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(AppSpacing.lg),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          _buildHeader(),
          Container(height: 1, color: AppColors.border),
          Expanded(
            child: Stack(
              children: [
                // Background large text
                if (_selectedTab == 0) _buildBackgroundText(),
                // Main content - use IndexedStack to keep DevRunnerPanel alive
                Positioned.fill(
                  child: IndexedStack(
                    index: _selectedTab,
                    alignment: Alignment.center,
                    sizing: StackFit.expand,
                    children: [
                      Center(child: _buildLoginForm()),
                      DevRunnerPanel(key: _devRunnerKey),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackgroundText() {
    final baseStyle = GoogleFonts.playfairDisplay(
      fontSize: 72,
      fontWeight: FontWeight.w600,
      color: AppColors.text,
      letterSpacing: -1,
      height: 1,
    );
    final rStyle = GoogleFonts.playfairDisplay(
      fontSize: 80,
      fontWeight: FontWeight.w600,
      color: AppColors.text,
      letterSpacing: -1,
      height: 1,
    );
    
    return Positioned(
      bottom: 40,
      left: 0,
      right: 0,
      child: Center(
        child: AnimatedBuilder(
          animation: _animController,
          builder: (ctx, _) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('PodiumLed', style: baseStyle),
                Transform.translate(
                  offset: Offset(0, _gAnim.value),
                  child: Text('g', style: baseStyle),
                ),
                Transform.translate(
                  offset: Offset(0, _eAnim.value),
                  child: Text('e', style: baseStyle),
                ),
                Transform.translate(
                  offset: Offset(0, _rAnim.value),
                  child: Text('r', style: rStyle),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
            child: const Icon(Icons.grid_view, size: 14, color: AppColors.text),
          ),
          const SizedBox(width: AppSpacing.md),
          Text('Podium Ledger', style: AppTextStyles.heading),
          const Spacer(),
          _buildTabToggle(),
        ],
      ),
    );
  }

  Widget _buildTabToggle() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: _showServerHint ? AppColors.text : AppColors.border, width: _showServerHint ? 2 : 1),
            borderRadius: AppBorders.radius,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildToggleButton('Login', 0),
              Container(width: 1, height: 24, color: AppColors.border),
              _buildToggleButton('Servers', 1),
            ],
          ),
        ),
        // Tooltip pointing to Servers tab
        if (_showServerHint)
          Positioned(
            top: 40,
            right: 0,
            child: _buildHintTooltip(),
          ),
      ],
    );
  }

  Widget _buildHintTooltip() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Arrow
        Container(
          margin: const EdgeInsets.only(right: 30),
          child: CustomPaint(
            size: const Size(12, 8),
            painter: _TrianglePainter(),
          ),
        ),
        // Tooltip box
        Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.text,
            borderRadius: AppBorders.radius,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.info_outline, size: 14, color: Colors.white),
              const SizedBox(width: AppSpacing.sm),
              const Text(
                'Start the servers first!',
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
              ),
              const SizedBox(width: AppSpacing.sm),
              GestureDetector(
                onTap: () {
                  setState(() {
                    _showServerHint = false;
                    _selectedTab = 1;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppBorders.radius,
                  ),
                  child: const Text('Go', style: TextStyle(color: AppColors.text, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildToggleButton(String label, int index) {
    final isSelected = _selectedTab == index;
    final isServers = index == 1;
    return GestureDetector(
      onTap: () => setState(() {
        _selectedTab = index;
        if (isServers) _showServerHint = false;
      }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.selected : (_showServerHint && isServers ? AppColors.hover : Colors.transparent),
          borderRadius: index == 0
              ? const BorderRadius.only(topLeft: Radius.circular(3), bottomLeft: Radius.circular(3))
              : const BorderRadius.only(topRight: Radius.circular(3), bottomRight: Radius.circular(3)),
        ),
        child: Text(
          label,
          style: AppTextStyles.small.copyWith(
            color: isSelected ? AppColors.text : (_showServerHint && isServers ? AppColors.text : AppColors.textMuted),
            fontWeight: isSelected || (_showServerHint && isServers) ? FontWeight.w500 : FontWeight.w400,
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return AnimatedBuilder(
          animation: _macbookAnimController,
          builder: (context, child) {
            return Opacity(
              opacity: _macbookOpacity.value,
              child: Transform.scale(
                scale: _macbookScale.value,
                child: SizedBox(
                  width: 650,
                  height: 440,
                  child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Macbook frame
                    Image.asset('assets/macbook.png', width: 650, fit: BoxFit.contain),
                    // PIN form inside the screen
                    Positioned(
                      top: 110,
                      child: Container(
                        width: 240,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text('Admin PIN', style: AppTextStyles.small),
                            const SizedBox(height: AppSpacing.sm),
                            Container(
                              decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                              child: TextField(
                                controller: _pinController,
                                obscureText: true,
                                maxLength: 6,
                                keyboardType: TextInputType.number,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(6),
                                ],
                                style: AppTextStyles.body,
                                decoration: const InputDecoration(
                                  hintText: 'Enter 6-digit PIN',
                                  hintStyle: TextStyle(color: AppColors.disabled, fontSize: 12),
                                  border: InputBorder.none,
                                  counterText: '',
                                  contentPadding: EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                                ),
                                onSubmitted: (_) => _handleLogin(),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.md),
                            GestureDetector(
                              onTap: _isLoading ? null : _handleLogin,
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                                decoration: BoxDecoration(color: AppColors.text, borderRadius: AppBorders.radius),
                                child: Center(
                                  child: _isLoading
                                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                                      : const Text('Login', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
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
            ),
          );
        },
    );
  }
}

// Triangle painter for tooltip arrow
class _TrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = AppColors.text;
    final path = Path()
      ..moveTo(size.width / 2, 0)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
