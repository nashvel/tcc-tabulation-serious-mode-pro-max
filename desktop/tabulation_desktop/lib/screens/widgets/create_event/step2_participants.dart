import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step2Participants extends StatelessWidget {
  final List<Map<String, dynamic>> participants;
  final ValueChanged<int> onAddParticipant;
  final Function(int, String, dynamic) onParticipantChanged;

  const Step2Participants({
    super.key,
    required this.participants,
    required this.onAddParticipant,
    required this.onParticipantChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Row(
          children: [
            SizedBox(width: 40, child: Text('No.', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(flex: 2, child: Text('Name *', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            SizedBox(width: 80, child: Text('Gender', style: AppTextStyles.small)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(height: 1, color: AppColors.border),
        const SizedBox(height: AppSpacing.sm),
        // Participant rows
        ...participants.asMap().entries.map((entry) {
          final i = entry.key;
          final p = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              children: [
                SizedBox(
                  width: 40,
                  child: _field((v) => onParticipantChanged(i, 'number', v), p['number']?.toString() ?? ''),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  flex: 2,
                  child: _field((v) => onParticipantChanged(i, 'name', v), p['name']?.toString() ?? ''),
                ),
                const SizedBox(width: AppSpacing.sm),
                SizedBox(
                  width: 80,
                  child: _genderDropdown(i, p['gender'] ?? 'Female'),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: AppSpacing.sm),
        GestureDetector(
          onTap: () => onAddParticipant(0),
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

  Widget _genderDropdown(int index, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          isDense: true,
          style: AppTextStyles.body.copyWith(fontSize: 11),
          items: ['Female', 'Male'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
          onChanged: (v) => onParticipantChanged(index, 'gender', v ?? 'Female'),
        ),
      ),
    );
  }
}
