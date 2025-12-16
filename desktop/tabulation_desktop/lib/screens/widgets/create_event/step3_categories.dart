import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

/// Step 3: Rounds (renamed from Categories to match Vue)
/// Each round can have its own criteria in Step 4
class Step3Rounds extends StatelessWidget {
  final List<Map<String, dynamic>> rounds;
  final ValueChanged<int> onAddRound;
  final Function(int, String, dynamic) onRoundChanged;
  final Function(int)? onRemoveRound;

  const Step3Rounds({
    super.key,
    required this.rounds,
    required this.onAddRound,
    required this.onRoundChanged,
    this.onRemoveRound,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Info text
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          margin: const EdgeInsets.only(bottom: AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.border.withOpacity(0.3),
            borderRadius: AppBorders.radius,
          ),
          child: Row(
            children: [
              const Icon(Icons.layers, size: 14, color: AppColors.textMuted),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'Add rounds/categories for your event. Each round can have its own scoring criteria.',
                  style: AppTextStyles.small.copyWith(color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
        // Round list
        ...rounds.asMap().entries.map((entry) {
          final i = entry.key;
          final r = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              border: AppBorders.all,
              borderRadius: AppBorders.radius,
            ),
            child: Row(
              children: [
                // Round number badge
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: AppColors.text.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      '${i + 1}',
                      style: AppTextStyles.small.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                // Round name field
                Expanded(
                  child: _field(
                    (v) => onRoundChanged(i, 'name', v),
                    r['name']?.toString() ?? '',
                    hint: 'Round name (e.g. Casual Wear, Q&A)',
                  ),
                ),
                // Remove button
                if (onRemoveRound != null && rounds.length > 1)
                  GestureDetector(
                    onTap: () => onRemoveRound!(i),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: const Icon(Icons.close, size: 14, color: AppColors.textMuted),
                    ),
                  ),
              ],
            ),
          );
        }),
        const SizedBox(height: AppSpacing.sm),
        // Add button
        GestureDetector(
          onTap: () => onAddRound(0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.border, style: BorderStyle.solid),
              borderRadius: AppBorders.radius,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.add, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text('Add Round', style: AppTextStyles.small.copyWith(color: AppColors.textMuted)),
              ],
            ),
          ),
        ),
        // Empty state
        if (rounds.isEmpty)
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Center(
              child: Column(
                children: [
                  const Icon(Icons.layers_outlined, size: 32, color: AppColors.disabled),
                  const SizedBox(height: AppSpacing.sm),
                  Text('No rounds added yet', style: AppTextStyles.small.copyWith(color: AppColors.disabled)),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _field(ValueChanged<String> onChanged, String initial, {String hint = ''}) {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        controller: TextEditingController(text: initial),
        onChanged: onChanged,
        style: AppTextStyles.body.copyWith(fontSize: 11),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 11),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          isDense: true,
        ),
      ),
    );
  }
}
