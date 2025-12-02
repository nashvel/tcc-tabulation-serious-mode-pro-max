import 'package:flutter/material.dart';
import 'widgets/dashboard_screen.dart';
import 'widgets/events_screen.dart';
import 'widgets/settings_screen.dart';
import 'widgets/help_screen.dart';
import 'widgets/setup_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final List<String> _menuItems = ['Dashboard', 'Setup', 'Events', 'Settings', 'Help'];
  final List<IconData> _menuIcons = [
    Icons.dashboard,
    Icons.build,
    Icons.event,
    Icons.settings,
    Icons.help,
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;
        final sidebarWidth = isMobile ? 60.0 : 80.0;
        final logoPadding = isMobile ? 12.0 : 16.0;
        final logoSize = isMobile ? 36.0 : 48.0;
        final logoIconSize = isMobile ? 20.0 : 28.0;
        final menuIconSize = isMobile ? 20.0 : 28.0;
        final menuPadding = isMobile ? 4.0 : 8.0;
        final menuVerticalPadding = isMobile ? 4.0 : 8.0;

        return Scaffold(
          body: Row(
            children: [
              // Sidebar
              Container(
                width: sidebarWidth,
                decoration: BoxDecoration(
                  color: Colors.blue.shade900,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(2, 0),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Logo
                    Padding(
                      padding: EdgeInsets.all(logoPadding),
                      child: Container(
                        width: logoSize,
                        height: logoSize,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.assessment,
                          color: Colors.blue.shade900,
                          size: logoIconSize,
                        ),
                      ),
                    ),
                    SizedBox(height: isMobile ? 12 : 24),
                    // Menu Items
                    Expanded(
                      child: ListView.builder(
                        itemCount: _menuItems.length,
                        itemBuilder: (context, index) {
                          final isSelected = _selectedIndex == index;
                          return Padding(
                            padding: EdgeInsets.symmetric(vertical: menuVerticalPadding),
                            child: Tooltip(
                              message: _menuItems[index],
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: () {
                                    setState(() => _selectedIndex = index);
                                  },
                                  child: Container(
                                    margin: EdgeInsets.symmetric(
                                      horizontal: menuPadding,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? Colors.white.withOpacity(0.2)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      _menuIcons[index],
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.white70,
                                      size: menuIconSize,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    // Logout Button
                    Padding(
                      padding: EdgeInsets.all(logoPadding),
                      child: Tooltip(
                        message: 'Logout',
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              Navigator.of(context).pushNamedAndRemoveUntil(
                                '/',
                                (route) => false,
                              );
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.red.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: EdgeInsets.all(isMobile ? 6 : 8),
                              child: Icon(
                                Icons.logout,
                                color: Colors.white,
                                size: menuIconSize,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Main Content
              Expanded(
                child: _buildContent(),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildContent() {
    switch (_selectedIndex) {
      case 0:
        return const DashboardScreen();
      case 1:
        return const SetupScreen();
      case 2:
        return const EventsScreen();
      case 3:
        return const SettingsScreen();
      case 4:
        return const HelpScreen();
      default:
        return const DashboardScreen();
    }
  }
}
