import 'package:flutter/material.dart';

class EmptyEventsView extends StatelessWidget {
  const EmptyEventsView({super.key});

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final iconSize = isMobile ? 48.0 : 64.0;
    final titleFontSize = isMobile ? 16.0 : 18.0;
    final subtitleFontSize = isMobile ? 12.0 : 14.0;
    final padding = isMobile ? 16.0 : 24.0;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.event_note,
            size: iconSize,
            color: Colors.grey.shade300,
          ),
          SizedBox(height: padding),
          Text(
            'No events yet',
            style: TextStyle(
              fontSize: titleFontSize,
              color: Colors.grey.shade600,
            ),
          ),
          SizedBox(height: padding * 0.5),
          Text(
            'Create a new event to get started',
            style: TextStyle(
              fontSize: subtitleFontSize,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }
}
