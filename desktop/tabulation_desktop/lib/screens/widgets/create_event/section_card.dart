import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final double padding;
  final double labelFontSize;
  final Widget child;

  const SectionCard({
    super.key,
    required this.title,
    required this.padding,
    required this.labelFontSize,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.background,
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      padding: EdgeInsets.all(padding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.body.copyWith(
              fontSize: labelFontSize,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          child,
        ],
      ),
    );
  }
}
