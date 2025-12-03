import 'package:flutter/material.dart';
import '../../create_event_screen.dart';

class SetupHeader extends StatelessWidget {
  const SetupHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 12.0 : 24.0;
    final titleFontSize = isMobile ? 18.0 : 28.0;

    return Container(
      color: Colors.white,
      padding: EdgeInsets.all(padding),
      child: Row(
        children: [
          Text(
            'Event Setup',
            style: TextStyle(
              fontSize: titleFontSize,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const CreateEventScreen(),
                ),
              );
            },
            icon: Icon(Icons.add, size: isMobile ? 16 : 18),
            label: Text(
              isMobile ? 'New Event' : 'Create New Event',
              style: TextStyle(
                fontSize: isMobile ? 12 : 14,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 12 : 24,
                vertical: isMobile ? 8 : 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
