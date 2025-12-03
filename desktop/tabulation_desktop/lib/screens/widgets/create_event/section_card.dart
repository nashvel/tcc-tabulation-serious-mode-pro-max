import 'package:flutter/material.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final double padding;
  final double labelFontSize;
  final Widget child;

  const SectionCard({
    required this.title,
    required this.padding,
    required this.labelFontSize,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
      padding: EdgeInsets.all(padding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: labelFontSize + 2,
              fontWeight: FontWeight.bold,
              color: Colors.blue.shade900,
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}
