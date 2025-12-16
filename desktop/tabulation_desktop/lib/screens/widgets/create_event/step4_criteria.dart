import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

/// Step 4: Criteria per Round (matching Vue structure)
/// Each round has its own criteria with percentage that should total 100%
class Step4Criteria extends StatelessWidget {
  final List<Map<String, dynamic>> rounds;
  final Function(int roundIndex) onAddCriteria;
  final Function(int roundIndex, int criteriaIndex, String field, dynamic value) onCriteriaChanged;
  final Function(int roundIndex, int criteriaIndex)? onRemoveCriteria;

  const Step4Criteria({
    super.key,
    required this.rounds,
    required this.onAddCriteria,
    required this.onCriteriaChanged,
    this.onRemoveCriteria,
  });

  int _getTotalPercentage(List<dynamic>? criteria) {
    if (criteria == null || criteria.isEmpty) return 0;
    return criteria.fold<int>(0, (sum, c) {
      final points = c['points'];
      if (points is int) return sum + points;
      if (points is double) return sum + points.toInt();
      if (points is String) return sum + (int.tryParse(points) ?? 0);
      return sum;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (rounds.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.layers_outlined, size: 32, color: AppColors.disabled),
              const SizedBox(height: AppSpacing.sm),
              Text('No rounds added', style: AppTextStyles.small.copyWith(color: AppColors.disabled)),
              const SizedBox(height: 4),
              Text('Go back to add rounds first', style: AppTextStyles.small.copyWith(color: AppColors.disabled, fontSize: 10)),
            ],
          ),
        ),
      );
    }

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
              const Icon(Icons.percent, size: 14, color: AppColors.textMuted),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'Add criteria with percentage (%) for each round. Total should equal 100%.',
                  style: AppTextStyles.small.copyWith(color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
        // Rounds with criteria
        ...rounds.asMap().entries.map((entry) {
          final roundIndex = entry.key;
          final round = entry.value;
          final criteria = (round['criteria'] as List<dynamic>?) ?? [];
          final total = _getTotalPercentage(criteria);
          final isComplete = total == 100;

          return Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.md),
            decoration: BoxDecoration(
              border: AppBorders.all,
              borderRadius: AppBorders.radius,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Round header
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.border.withOpacity(0.3),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(8),
                      topRight: Radius.circular(8),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: AppColors.text.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            '${roundIndex + 1}',
                            style: AppTextStyles.small.copyWith(fontWeight: FontWeight.w600, fontSize: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          round['name']?.toString() ?? 'Round ${roundIndex + 1}',
                          style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 11),
                        ),
                      ),
                      // Total percentage indicator
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isComplete ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Total: $total%',
                          style: AppTextStyles.small.copyWith(
                            color: isComplete ? Colors.green : Colors.orange,
                            fontWeight: FontWeight.w600,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Criteria list
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  child: Column(
                    children: [
                      if (criteria.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                          child: Text(
                            'No criteria added for this round',
                            style: AppTextStyles.small.copyWith(color: AppColors.disabled),
                          ),
                        )
                      else
                        ...criteria.asMap().entries.map((cEntry) {
                          final criteriaIndex = cEntry.key;
                          final c = cEntry.value as Map<String, dynamic>;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                            child: Row(
                              children: [
                                // Criteria name
                                Expanded(
                                  flex: 3,
                                  child: _field(
                                    (v) => onCriteriaChanged(roundIndex, criteriaIndex, 'name', v),
                                    c['name']?.toString() ?? '',
                                    hint: 'Criteria name (e.g. Beauty, Talent)',
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                // Percentage
                                SizedBox(
                                  width: 60,
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: _numField(
                                          (v) => onCriteriaChanged(roundIndex, criteriaIndex, 'points', int.tryParse(v) ?? 0),
                                          c['points']?.toString() ?? '0',
                                        ),
                                      ),
                                      const SizedBox(width: 2),
                                      Text('%', style: AppTextStyles.small.copyWith(color: AppColors.textMuted)),
                                    ],
                                  ),
                                ),
                                // Remove button
                                if (onRemoveCriteria != null)
                                  GestureDetector(
                                    onTap: () => onRemoveCriteria!(roundIndex, criteriaIndex),
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      child: const Icon(Icons.close, size: 12, color: AppColors.textMuted),
                                    ),
                                  ),
                              ],
                            ),
                          );
                        }),
                      // Add criteria button
                      GestureDetector(
                        onTap: () => onAddCriteria(roundIndex),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.add, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 2),
                            Text('Add Criteria', style: AppTextStyles.small.copyWith(color: AppColors.textMuted, fontSize: 10)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
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
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 10),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
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
        textAlign: TextAlign.center,
        style: AppTextStyles.mono.copyWith(fontSize: 11),
        decoration: const InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          isDense: true,
        ),
      ),
    );
  }
}
