import 'package:flutter/material.dart';
import 'stat_card.dart';

class StatsRow extends StatelessWidget {
  final int totalEvents;
  final int activeEvents;
  final int completedEvents;
  final double spacing;

  const StatsRow({
    super.key,
    required this.totalEvents,
    required this.activeEvents,
    required this.completedEvents,
    required this.spacing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: StatCard(
            title: 'Total Events',
            value: totalEvents.toString(),
            color: Colors.blue,
          ),
        ),
        SizedBox(width: spacing),
        Expanded(
          child: StatCard(
            title: 'Active Events',
            value: activeEvents.toString(),
            color: Colors.green,
          ),
        ),
        SizedBox(width: spacing),
        Expanded(
          child: StatCard(
            title: 'Completed',
            value: completedEvents.toString(),
            color: Colors.orange,
          ),
        ),
      ],
    );
  }
}
