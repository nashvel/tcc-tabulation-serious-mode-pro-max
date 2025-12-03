import 'package:flutter/material.dart';
import '../../create_event_screen.dart';

class DashboardHeader extends StatelessWidget {
  final bool isMobile;
  final double padding;
  final double fontSize;
  final VoidCallback onEventCreated;

  const DashboardHeader({
    super.key,
    required this.isMobile,
    required this.padding,
    required this.fontSize,
    required this.onEventCreated,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.all(padding),
      child: Row(
        children: [
          Text(
            'Dashboard',
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          if (!isMobile)
            ElevatedButton.icon(
              onPressed: () => _navigateToCreateEvent(context),
              icon: const Icon(Icons.add),
              label: const Text('New Event'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  horizontal: padding * 2,
                  vertical: padding,
                ),
              ),
            )
          else
            FloatingActionButton.small(
              onPressed: () => _navigateToCreateEvent(context),
              child: const Icon(Icons.add),
            ),
        ],
      ),
    );
  }

  void _navigateToCreateEvent(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const CreateEventScreen(),
      ),
    ).then((_) => onEventCreated());
  }
}
