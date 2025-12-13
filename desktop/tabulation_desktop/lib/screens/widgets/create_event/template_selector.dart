import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class TemplateSelector extends StatelessWidget {
  final String eventType;
  final VoidCallback onApplyCandidateTemplate;
  final VoidCallback onApplyCategoryTemplate;
  final VoidCallback onApplyCriteriaTemplate;

  const TemplateSelector({
    super.key,
    required this.eventType,
    required this.onApplyCandidateTemplate,
    required this.onApplyCategoryTemplate,
    required this.onApplyCriteriaTemplate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline, size: 14, color: AppColors.textMuted),
              const SizedBox(width: AppSpacing.sm),
              Text('Quick Templates', style: AppTextStyles.small.copyWith(fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              _templateBtn('Candidates', onApplyCandidateTemplate),
              _templateBtn('Categories', onApplyCategoryTemplate),
              _templateBtn('Criteria', onApplyCriteriaTemplate),
            ],
          ),
        ],
      ),
    );
  }

  Widget _templateBtn(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.text,
          borderRadius: AppBorders.radius,
        ),
        child: Text(label, style: AppTextStyles.small.copyWith(color: Colors.white, fontSize: 10)),
      ),
    );
  }
}
