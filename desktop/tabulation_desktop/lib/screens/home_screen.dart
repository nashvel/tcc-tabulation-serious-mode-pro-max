import 'package:flutter/material.dart';
import 'widgets/dashboard_screen.dart';
import 'widgets/settings_screen.dart';
import 'widgets/help_screen.dart';
import 'widgets/setup_screen.dart';
import 'login_screen.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  
  final List<IconData> _menuIcons = [
    Icons.grid_view_outlined,
    Icons.build_outlined,
    Icons.settings_outlined,
    Icons.help_outline,
  ];
  
  final List<String> _menuLabels = [
    'Dashboard',
    'Setup',
    'Settings',
    'Help',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          // Narrow Sidebar
          _buildSidebar(),
          // Vertical divider
          Container(width: 1, color: AppColors.border),
          // Main Content
          Expanded(
            child: Column(
              children: [
                _buildHeader(),
                Container(height: 1, color: AppColors.border),
                Expanded(child: _buildContent()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 50,
      color: AppColors.background,
      child: Column(
        children: [
          const SizedBox(height: AppSpacing.md),
          // Logo
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              border: AppBorders.all,
              borderRadius: AppBorders.radius,
            ),
            child: const Icon(Icons.grid_view, size: 16, color: AppColors.text),
          ),
          const SizedBox(height: AppSpacing.xl),
          // Nav items
          ...List.generate(_menuIcons.length, (i) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: _buildNavItem(_menuIcons[i], i),
          )),
          const Spacer(),
          // Logout
          GestureDetector(
            onTap: () => Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const LoginScreen()),
            ),
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                borderRadius: AppBorders.radius,
              ),
              child: const Icon(Icons.logout, size: 18, color: AppColors.textMuted),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, int index) {
    final isSelected = _selectedIndex == index;
    return Tooltip(
      message: _menuLabels[index],
      child: GestureDetector(
        onTap: () => setState(() => _selectedIndex = index),
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.selected : Colors.transparent,
            borderRadius: AppBorders.radius,
          ),
          child: Icon(
            icon,
            size: 18,
            color: isSelected ? AppColors.text : AppColors.textMuted,
          ),
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
          Text(_menuLabels[_selectedIndex], style: AppTextStyles.heading),
        ],
      ),
    );
  }

  Widget _buildContent() {
    switch (_selectedIndex) {
      case 0: return const DashboardScreen();
      case 1: return const SetupScreen();
      case 2: return const SettingsScreen();
      case 3: return const HelpScreen();
      default: return const DashboardScreen();
    }
  }
}
