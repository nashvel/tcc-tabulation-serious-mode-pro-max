import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step3Categories extends StatelessWidget {
  final List<Map<String, String>> categories;
  final ValueChanged<int> onAddCategory;
  final Function(int, String, String) onCategoryChanged;

  const Step3Categories({
    super.key,
    required this.categories,
    required this.onAddCategory,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Expanded(child: Text('Name *', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(child: Text('Description', style: AppTextStyles.small)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(height: 1, color: AppColors.border),
        const SizedBox(height: AppSpacing.sm),
        // Category rows
        ...categories.asMap().entries.map((entry) {
          final i = entry.key;
          final c = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              children: [
                Expanded(child: _field((v) => onCategoryChanged(i, 'name', v), c['name'] ?? '')),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: _field((v) => onCategoryChanged(i, 'description', v), c['description'] ?? '')),
              ],
            ),
          );
        }),
        const SizedBox(height: AppSpacing.sm),
        GestureDetector(
          onTap: () => onAddCategory(0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.add, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text('Add', style: AppTextStyles.small.copyWith(color: AppColors.textMuted)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _field(ValueChanged<String> onChanged, String initial) {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        controller: TextEditingController(text: initial),
        onChanged: onChanged,
        style: AppTextStyles.body.copyWith(fontSize: 11),
        decoration: const InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          isDense: true,
        ),
      ),
    );
  }
}
