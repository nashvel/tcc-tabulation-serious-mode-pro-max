import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Getting Started', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: AppSpacing.md),
          Container(height: 1, color: AppColors.border),
          const SizedBox(height: AppSpacing.md),
          _buildHelpItem('1', 'Create a new event from the Dashboard'),
          _buildHelpItem('2', 'Add categories and scoring criteria'),
          _buildHelpItem('3', 'Configure judges for your event'),
          _buildHelpItem('4', 'Start the event and begin scoring'),
          _buildHelpItem('5', 'View results and export data'),
          const SizedBox(height: AppSpacing.xl),
          Text('Keyboard Shortcuts', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: AppSpacing.md),
          Container(height: 1, color: AppColors.border),
          const SizedBox(height: AppSpacing.md),
          _buildShortcut('Ctrl + N', 'New Event'),
          _buildShortcut('Ctrl + S', 'Save'),
          _buildShortcut('Esc', 'Close dialog'),
          const Spacer(),
          Text('Version 1.0.0', style: AppTextStyles.small),
        ],
      ),
    );
  }

  Widget _buildHelpItem(String number, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20, height: 20,
            decoration: BoxDecoration(
              border: AppBorders.all,
              borderRadius: AppBorders.radius,
            ),
            child: Center(child: Text(number, style: AppTextStyles.small.copyWith(fontSize: 10))),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: Text(text, style: AppTextStyles.body)),
        ],
      ),
    );
  }

  Widget _buildShortcut(String key, String action) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.hover,
              borderRadius: AppBorders.radius,
            ),
            child: Text(key, style: AppTextStyles.mono.copyWith(fontSize: 10)),
          ),
          const SizedBox(width: AppSpacing.md),
          Text(action, style: AppTextStyles.small),
        ],
      ),
    );
  }
}
