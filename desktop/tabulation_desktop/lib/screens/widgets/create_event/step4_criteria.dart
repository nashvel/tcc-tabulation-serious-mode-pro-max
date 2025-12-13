import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step4Criteria extends StatelessWidget {
  final List<Map<String, dynamic>> criteria;
  final ValueChanged<int> onAddCriterion;
  final Function(int, String, dynamic) onCriterionChanged;

  const Step4Criteria({
    super.key,
    required this.criteria,
    required this.onAddCriterion,
    required this.onCriterionChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Expanded(flex: 2, child: Text('Name *', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            SizedBox(width: 60, child: Text('Max', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            SizedBox(width: 60, child: Text('%', style: AppTextStyles.small)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(height: 1, color: AppColors.border),
        const SizedBox(height: AppSpacing.sm),
        // Criteria rows
        ...criteria.asMap().entries.map((entry) {
          final i = entry.key;
          final c = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: _field((v) => onCriterionChanged(i, 'name', v), c['name']?.toString() ?? ''),
                ),
                const SizedBox(width: AppSpacing.sm),
                SizedBox(
                  width: 60,
                  child: _numField((v) => onCriterionChanged(i, 'max_score', int.tryParse(v) ?? 100), c['max_score']?.toString() ?? '100'),
                ),
                const SizedBox(width: AppSpacing.sm),
                SizedBox(
                  width: 60,
                  child: _numField((v) => onCriterionChanged(i, 'percentage', double.tryParse(v) ?? 0), c['percentage']?.toString() ?? '0'),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: AppSpacing.sm),
        GestureDetector(
          onTap: () => onAddCriterion(0),
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

  Widget _numField(ValueChanged<String> onChanged, String initial) {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        controller: TextEditingController(text: initial),
        onChanged: onChanged,
        keyboardType: TextInputType.number,
        style: AppTextStyles.mono.copyWith(fontSize: 11),
        decoration: const InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          isDense: true,
        ),
      ),
    );
  }
}
